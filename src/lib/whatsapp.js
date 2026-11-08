import 'server-only';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { getOrder } from './orders';
import { formatPrice, PAYMENT_LABELS } from './format';
import { normalizePkPhone } from './pakistan';
import { getSettings, saveSetting } from './settings';

// WhatsApp order alerts through Baileys (WhatsApp Web). One connection per
// server process, kept on globalThis so hot reloads and route modules share it.
// Run the app as a single process (PM2 fork mode), never in cluster mode.

// The login session lives outside the project folder: it holds credentials, must
// survive redeploys, and file changes inside the project would trigger dev reloads.
const SESSION_DIR = path.resolve(
  /*turbopackIgnore: true*/ process.env.WHATSAPP_SESSION_DIR || path.join(os.homedir(), '.punjabshoes', 'whatsapp-session')
);

const wa =
  globalThis.__punjabWhatsApp ||
  (globalThis.__punjabWhatsApp = {
    sock: null,
    status: 'disconnected', // disconnected | connecting | qr | connected
    qr: null, // data: URL of the QR image
    me: null, // linked phone number
    error: null,
    retries: 0,
    stopping: false,
    recent: [], // last messages sent, newest first
  });

export const WHATSAPP_DEFAULTS = { order_alerts: true, recipients: [], customer_confirmation: false };

export async function getWhatsAppSettings() {
  const s = await getSettings();
  return { ...WHATSAPP_DEFAULTS, ...(s.whatsapp || {}) };
}

export function saveWhatsAppSettings(value) {
  return saveSetting('whatsapp', value);
}

/** Converts 03001234567 / +92 300 1234567 / international digits into a WhatsApp JID. */
export function toJid(number) {
  const pk = normalizePkPhone(number);
  const digits = pk ? `92${pk.slice(1)}` : String(number || '').replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return `${digits}@s.whatsapp.net`;
}

function displayNumber(jid) {
  const digits = String(jid || '').split(/[:@]/)[0];
  return digits ? `+${digits}` : null;
}

export function whatsappStatus() {
  return { status: wa.status, qr: wa.qr, me: wa.me, error: wa.error, recent: wa.recent };
}

/** True once a phone has scanned the QR (an unscanned QR also leaves a creds file). */
async function sessionLinked() {
  try {
    const creds = JSON.parse(await fs.readFile(path.join(SESSION_DIR, 'creds.json'), 'utf8'));
    return Boolean(creds.me?.id);
  } catch {
    return false;
  }
}

async function clearSession() {
  await fs.rm(SESSION_DIR, { recursive: true, force: true });
}

/** Starts (or resumes) the WhatsApp connection. A QR code appears in `whatsappStatus()` if not linked yet. */
export async function connectWhatsApp() {
  if (wa.sock && ['connecting', 'qr', 'connected'].includes(wa.status)) return whatsappStatus();
  wa.stopping = false;
  wa.status = 'connecting';
  wa.error = null;
  wa.qr = null;

  const [{ default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers }, QRCode, { default: pino }] =
    await Promise.all([import('baileys'), import('qrcode'), import('pino')]);

  await fs.mkdir(SESSION_DIR, { recursive: true });
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  let version;
  try {
    ({ version } = await fetchLatestBaileysVersion());
  } catch {
    /* use the library's built-in version */
  }

  const sock = makeWASocket({
    auth: state,
    version,
    logger: pino({ level: 'silent' }),
    browser: Browsers.ubuntu('PunjabShoes Admin'),
    markOnlineOnConnect: false, // keep notifications ringing on the phone
    syncFullHistory: false,
    shouldSyncHistoryMessage: () => false,
  });
  wa.sock = sock;

  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', async ({ connection, lastDisconnect, qr }) => {
    if (sock !== wa.sock) return; // an older socket
    if (qr) {
      wa.status = 'qr';
      wa.qr = await QRCode.toDataURL(qr, { margin: 1, width: 280 });
    }
    if (connection === 'open') {
      wa.status = 'connected';
      wa.qr = null;
      wa.error = null;
      wa.retries = 0;
      wa.me = displayNumber(sock.user?.id);
    }
    if (connection === 'close') {
      wa.sock = null;
      wa.qr = null;
      wa.me = null;
      const code = lastDisconnect?.error?.output?.statusCode;
      if (wa.stopping) {
        wa.status = 'disconnected';
        return;
      }
      if (code === DisconnectReason.loggedOut) {
        await clearSession();
        wa.status = 'disconnected';
        wa.error = 'WhatsApp was unlinked from the phone. Click “Connect WhatsApp” to scan again.';
        return;
      }
      if (!state.creds.registered && code !== DisconnectReason.restartRequired) {
        // QR codes expired without a scan: stop instead of looping.
        wa.status = 'disconnected';
        wa.error = 'The QR code expired. Click “Connect WhatsApp” to get a new one.';
        return;
      }
      // Network drop or the normal restart right after the first scan: reconnect with backoff.
      wa.status = 'connecting';
      const delay = code === DisconnectReason.restartRequired ? 0 : Math.min(60_000, 2_000 * 2 ** wa.retries++);
      setTimeout(() => connectWhatsApp().catch((e) => console.error('[whatsapp] reconnect failed', e)), delay);
    }
  });

  return whatsappStatus();
}

/** Closes the connection. With `logout`, also unlinks this device from the phone and deletes the session. */
export async function disconnectWhatsApp({ logout = false } = {}) {
  wa.stopping = true;
  const sock = wa.sock;
  wa.sock = null;
  try {
    if (sock) {
      if (logout) await sock.logout();
      else sock.end(undefined);
    }
  } catch {
    /* already closed */
  }
  if (logout) await clearSession();
  Object.assign(wa, { status: 'disconnected', qr: null, me: null, error: null });
  return whatsappStatus();
}

/** Called once at server start: resumes the connection if a phone was linked before. */
export async function startWhatsAppIfLinked() {
  if (await sessionLinked()) await connectWhatsApp();
}

function remember(entry) {
  wa.recent = [{ ...entry, at: new Date().toISOString() }, ...wa.recent].slice(0, 10);
}

export async function sendWhatsApp(number, text, label = 'Message') {
  if (wa.status !== 'connected' || !wa.sock) throw new Error('WhatsApp is not connected.');
  const jid = typeof number === 'string' && number.includes('@') ? number : toJid(number);
  if (!jid) throw new Error(`Invalid WhatsApp number: ${number}`);
  try {
    await wa.sock.sendMessage(jid, { text });
    remember({ label, to: displayNumber(jid), ok: true });
  } catch (e) {
    remember({ label, to: displayNumber(jid), ok: false, error: e.message });
    throw e;
  }
}

function siteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
}

export function orderAlertText(order) {
  const lines = [
    `🛍️ *New Order #${order.order_number}*`,
    '',
    `👤 ${order.name}`,
    `📞 ${order.phone}`,
    `📍 ${order.address}, ${order.city}, ${order.province}`,
    '',
    '*Items:*',
    ...order.items.map((i) => `• ${i.product_name}${[i.size && `Size ${i.size}`, i.color].filter(Boolean).length ? ` (${[i.size && `Size ${i.size}`, i.color].filter(Boolean).join(', ')})` : ''} × ${i.quantity} — ${formatPrice(i.line_total)}`),
    '',
    `Subtotal: ${formatPrice(order.subtotal)}`,
    ...(order.discount > 0 ? [`Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}: −${formatPrice(order.discount)}`] : []),
    `Delivery: ${order.shipping_fee > 0 ? formatPrice(order.shipping_fee) : 'FREE'}`,
    ...(order.payment_fee > 0 ? [`COD charges: ${formatPrice(order.payment_fee)}`] : []),
    `*Total: ${formatPrice(order.total)}*`,
    `Payment: ${PAYMENT_LABELS[order.payment_method]}`,
    ...(order.notes ? ['', `📝 ${order.notes}`] : []),
    '',
    `Open order: ${siteUrl()}/admin/orders/${order.id}`,
  ];
  return lines.join('\n');
}

function customerConfirmationText(order, storeName) {
  return [
    `Assalam o Alaikum ${order.name.split(' ')[0]}! 👋`,
    '',
    `Thank you for your order at *${storeName}*.`,
    `Order: *#${order.order_number}*`,
    `Total: *${formatPrice(order.total)}* (${PAYMENT_LABELS[order.payment_method]})`,
    '',
    'We will contact you shortly to confirm your order.',
    `Track your order: ${siteUrl()}/order/${order.order_number}?t=${order.access_token}`,
  ].join('\n');
}

/**
 * Sends the new-order alert to the shop's WhatsApp numbers (and, if enabled,
 * a confirmation to the customer). Never throws: a WhatsApp problem must not
 * affect the order itself.
 */
export async function notifyNewOrder(orderId) {
  try {
    const settings = await getWhatsAppSettings();
    if (!settings.order_alerts && !settings.customer_confirmation) return;
    const order = await getOrder({ id: orderId });
    if (!order) return;
    if (wa.status !== 'connected') {
      remember({ label: `Order alert #${order.order_number}`, to: null, ok: false, error: 'WhatsApp not connected' });
      return;
    }

    if (settings.order_alerts) {
      // No numbers set: send to the linked number itself (“Message yourself” chat).
      const targets = settings.recipients.length ? settings.recipients : [wa.sock.user?.id?.replace(/:\d+@/, '@')];
      for (const to of targets) {
        await sendWhatsApp(to, orderAlertText(order), `Order alert #${order.order_number}`).catch((e) => console.error('[whatsapp] alert failed', e.message));
      }
    }
    if (settings.customer_confirmation) {
      const { store } = await getSettings();
      await sendWhatsApp(order.phone, customerConfirmationText(order, store.name), `Customer confirmation #${order.order_number}`).catch((e) =>
        console.error('[whatsapp] customer message failed', e.message)
      );
    }
  } catch (e) {
    console.error('[whatsapp] notifyNewOrder', e);
  }
}
