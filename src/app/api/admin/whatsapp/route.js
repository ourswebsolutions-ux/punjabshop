import { z } from 'zod';
import { handler, ok, readJson } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { normalizePkPhone } from '@/lib/pakistan';
import {
  connectWhatsApp,
  disconnectWhatsApp,
  getWhatsAppSettings,
  saveWhatsAppSettings,
  sendWhatsApp,
  toJid,
  whatsappStatus,
} from '@/lib/whatsapp';

export const GET = handler(async () => {
  await requireAdmin('dashboard');
  return ok({ ...whatsappStatus(), settings: await getWhatsAppSettings() });
});

const actionSchema = z.object({ action: z.enum(['connect', 'disconnect', 'logout', 'test']) });

export const POST = handler(async (req) => {
  await requireAdmin('settings');
  const { action } = actionSchema.parse(await readJson(req));
  if (action === 'connect') await connectWhatsApp();
  if (action === 'disconnect') await disconnectWhatsApp();
  if (action === 'logout') await disconnectWhatsApp({ logout: true });
  if (action === 'test') {
    const { recipients } = await getWhatsAppSettings();
    const status = whatsappStatus();
    if (status.status !== 'connected') throw new AppError('Connect WhatsApp first.');
    const targets = recipients.length ? recipients : [status.me];
    for (const to of targets) {
      await sendWhatsApp(to, '✅ PunjabShoes test message. New orders will arrive here on WhatsApp.', 'Test message');
    }
    return ok({ ...whatsappStatus(), message: `Test message sent to ${targets.join(', ')}.` });
  }
  return ok(whatsappStatus());
});

const settingsSchema = z.object({
  order_alerts: z.boolean(),
  customer_confirmation: z.boolean(),
  recipients: z
    .array(z.string().trim().min(1))
    .max(5, 'Up to 5 numbers')
    .transform((list, ctx) =>
      list.map((n) => {
        if (!toJid(n)) ctx.addIssue({ code: 'custom', message: `“${n}” is not a valid WhatsApp number` });
        return normalizePkPhone(n) || n.replace(/[^\d+]/g, '');
      })
    ),
});

export const PUT = handler(async (req) => {
  await requireAdmin('settings');
  const value = settingsSchema.parse(await readJson(req));
  await saveWhatsAppSettings(value);
  return ok({ message: 'WhatsApp settings saved.', settings: value });
});
