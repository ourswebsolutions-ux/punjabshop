// Runs once when the Next.js server starts.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Resume the WhatsApp order-alert connection if a phone was linked before.
    const { startWhatsAppIfLinked } = await import('./lib/whatsapp');
    startWhatsAppIfLinked().catch((e) => console.error('[whatsapp] could not resume session', e));
  }
}
