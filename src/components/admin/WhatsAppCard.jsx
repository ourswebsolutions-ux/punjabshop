'use client';

import { useCallback, useEffect, useState } from 'react';
import Icon from '@/components/Icon';
import { api } from '@/lib/client-api';
import { formatDate } from '@/lib/format';
import { ConfirmDialog, Toggle } from './ui';

export default function WhatsAppCard({ canManage }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(null);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState(null);
  const [confirmUnlink, setConfirmUnlink] = useState(false);

  const load = useCallback(async () => {
    try {
      const d = await api('/api/admin/whatsapp');
      setData(d);
      setForm((f) => f || { ...d.settings, recipientsText: d.settings.recipients.join(', ') });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Poll quickly while waiting for a scan, slowly otherwise.
  const status = data?.status;
  useEffect(() => {
    const t = setInterval(load, status === 'qr' || status === 'connecting' ? 2000 : 15000);
    return () => clearInterval(t);
  }, [status, load]);

  async function act(action) {
    setBusy(action);
    setMsg(null);
    try {
      const d = await api('/api/admin/whatsapp', { method: 'POST', body: { action } });
      setData((x) => ({ ...x, ...d }));
      if (d.message) setMsg({ type: 'success', text: d.message });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  async function saveSettings(e) {
    e.preventDefault();
    setBusy('save');
    setMsg(null);
    try {
      const recipients = form.recipientsText.split(/[,\n]/).map((s) => s.trim()).filter(Boolean);
      const d = await api('/api/admin/whatsapp', { method: 'PUT', body: { order_alerts: form.order_alerts, customer_confirmation: form.customer_confirmation, recipients } });
      setForm({ ...d.settings, recipientsText: d.settings.recipients.join(', ') });
      setMsg({ type: 'success', text: d.message });
    } catch (e) {
      setMsg({ type: 'error', text: e.message });
    } finally {
      setBusy(null);
    }
  }

  const badge = {
    connected: ['status--active', 'Connected'],
    qr: ['status--pending', 'Waiting for scan'],
    connecting: ['status--pending', 'Connecting…'],
    disconnected: ['status--inactive', 'Not connected'],
  }[status || 'disconnected'];

  return (
    <section className="panel wa-card">
      <div className="panel__head">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="wa-card__icon"><Icon name="whatsapp" size={20} /></span>
          WhatsApp order alerts
        </h3>
        {data && <span className={`status ${badge[0]}`}>{badge[1]}</span>}
      </div>
      <div className="panel__body" style={{ display: 'grid', gap: 16 }}>
        {!data ? (
          <p className="muted">Loading…</p>
        ) : status === 'connected' ? (
          <>
            <p>
              Linked to <b>{data.me}</b>. Every new order is sent on WhatsApp{' '}
              {form?.recipients?.length ? <>to <b>{form.recipients.join(', ')}</b></> : <>to this number’s “Message yourself” chat</>}.
            </p>
            {canManage && form && (
              <form onSubmit={saveSettings} style={{ display: 'grid', gap: 12 }}>
                <div className="field">
                  <label htmlFor="wa-to">Send order alerts to (WhatsApp numbers)</label>
                  <input id="wa-to" className="input" value={form.recipientsText} onChange={(e) => setForm({ ...form, recipientsText: e.target.value })} placeholder="e.g. 03001234567, 03211234567" />
                  <span className="hint">
                    Leave empty to receive them in your own “Message yourself” chat. Tip: link a separate shop number and put your personal number here, so the alerts ring on your phone.
                  </span>
                </div>
                <Toggle checked={form.order_alerts} onChange={(v) => setForm({ ...form, order_alerts: v })} label="Send me a WhatsApp message for every new order" />
                <Toggle checked={form.customer_confirmation} onChange={(v) => setForm({ ...form, customer_confirmation: v })} label="Also send the customer an order confirmation on WhatsApp" />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button className="btn btn--primary btn--sm" disabled={!!busy}>{busy === 'save' ? 'Saving…' : 'Save'}</button>
                  <button type="button" className="btn btn--outline btn--sm" disabled={!!busy} onClick={() => act('test')}>{busy === 'test' ? 'Sending…' : 'Send test message'}</button>
                  <button type="button" className="btn btn--danger btn--sm" disabled={!!busy} onClick={() => setConfirmUnlink(true)} style={{ marginLeft: 'auto' }}>Disconnect WhatsApp</button>
                </div>
              </form>
            )}
          </>
        ) : status === 'qr' ? (
          <div className="wa-card__scan">
            <img src={data.qr} alt="WhatsApp QR code – scan with your phone" width={240} height={240} />
            <ol>
              <li>Open <b>WhatsApp</b> on the phone you want to use for the shop.</li>
              <li>Tap <b>⋮ Menu</b> (Android) or <b>Settings</b> (iPhone) → <b>Linked devices</b>.</li>
              <li>Tap <b>Link a device</b> and point your phone at this code.</li>
              <li>Wait a few seconds – this box turns green when it’s connected.</li>
            </ol>
          </div>
        ) : status === 'connecting' ? (
          <p className="muted"><span className="spinner" style={{ display: 'inline-block', verticalAlign: '-3px', marginRight: 8 }} />Connecting to WhatsApp…</p>
        ) : (
          <>
            <p>Connect your shop’s WhatsApp once by scanning a QR code. After that, every new order is sent to your WhatsApp automatically, with the customer’s details and items.</p>
            {data.error && <p className="form-error">{data.error}</p>}
            {canManage ? (
              <div>
                <button className="btn btn--primary" onClick={() => act('connect')} disabled={!!busy}>
                  <Icon name="whatsapp" size={18} /> {busy === 'connect' ? 'Starting…' : 'Connect WhatsApp'}
                </button>
              </div>
            ) : (
              <p className="help">Ask the shop owner to connect WhatsApp.</p>
            )}
            <p className="help">
              This links like WhatsApp Web, using an unofficial connection. WhatsApp may block numbers that send a lot of messages this way, so it’s safest to use a separate shop number and only send order alerts.
            </p>
          </>
        )}

        {msg && <p className={msg.type === 'error' ? 'form-error' : 'form-success'}>{msg.text}</p>}

        {data?.recent?.length > 0 && (
          <div>
            <span className="label">Recent WhatsApp messages</span>
            <ul className="wa-card__log">
              {data.recent.map((r, i) => (
                <li key={i}>
                  <Icon name={r.ok ? 'check' : 'alert'} size={14} style={{ color: r.ok ? 'var(--green-600)' : 'var(--red)' }} />
                  <span>{r.label}{r.to ? ` → ${r.to}` : ''}{!r.ok && r.error ? ` (${r.error})` : ''}</span>
                  <small className="muted">{formatDate(r.at, true)}</small>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {confirmUnlink && (
        <ConfirmDialog
          title="Disconnect WhatsApp?"
          confirmLabel="Yes, disconnect"
          busy={busy === 'logout'}
          onClose={() => setConfirmUnlink(false)}
          onConfirm={async () => {
            await act('logout');
            setConfirmUnlink(false);
          }}
        >
          <p>The shop will stop sending order alerts and this device will be removed from your phone’s “Linked devices”. You can connect again any time by scanning a new code.</p>
        </ConfirmDialog>
      )}
    </section>
  );
}
