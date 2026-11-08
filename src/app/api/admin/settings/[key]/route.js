import { z } from 'zod';
import { handler, ok, readJson } from '@/lib/api';
import { requireAdmin } from '@/lib/auth';
import { AppError } from '@/lib/errors';
import { getSettings, saveSetting } from '@/lib/settings';

const str = (max = 300) => z.string().trim().max(max).optional().default('');
const url = z.union([z.literal(''), z.string().trim().url('Enter a full URL starting with https://').max(300)]).optional().default('');
const money = z.coerce.number().min(0).max(10_000_000);

const SCHEMAS = {
  store: z.object({
    name: z.string().trim().min(1).max(60),
    tagline: str(80),
    about: str(500),
    phone: str(30),
    whatsapp: str(30),
    email: z.string().trim().email().max(190),
    address: str(200),
    hours: str(120),
    map_link: url,
    logo: str(255),
    footer_logo: str(255),
    favicon: str(255),
    footer_note: str(120),
    payment_note: str(160),
    product_badges: z.array(z.string().trim().max(60)).max(3).default([]).transform((a) => a.filter(Boolean)),
    returns_note: str(500),
    social: z.object({ facebook: url, instagram: url, youtube: url, tiktok: url }),
    seo_title: str(190),
    seo_description: str(300),
  }),
  topbar: z.object({ left: str(80), center: str(80), right: str(80) }),
  shipping: z.object({
    flat_fee: money,
    free_threshold: money,
    cod_fee: money,
    estimated_days: str(60),
    city_fees: z.record(z.string().trim().min(1).max(80), money).default({}),
  }),
  payments: z.object({
    cod: z.object({ enabled: z.boolean(), label: str(60), max_order: money }),
    bank_transfer: z.object({ enabled: z.boolean(), bank_name: str(100), account_title: str(100), account_number: str(60), iban: str(40), instructions: str(500) }),
    jazzcash: z.object({ enabled: z.boolean(), sandbox: z.boolean(), merchant_id: str(60), password: str(120), integrity_salt: str(120) }),
    easypaisa: z.object({ enabled: z.boolean(), sandbox: z.boolean(), store_id: str(60), hash_key: str(120) }),
  }),
  homepage: z.object({
    sections: z.record(z.string(), z.boolean()),
    categories_title: str(80), categories_subtitle: str(120),
    best_sellers_title: str(80), best_sellers_subtitle: str(120), best_seller_ids: z.array(z.coerce.number().int().positive()).max(20),
    featured_title: str(80), featured_subtitle: str(120), featured_ids: z.array(z.coerce.number().int().positive()).max(20),
    new_arrivals_title: str(80), new_arrivals_subtitle: str(120),
    features_title: str(80),
    features: z.array(z.object({ icon: str(20), title: str(60), text: str(80) })).max(8),
    testimonials_title: str(80),
    newsletter_title: str(80), newsletter_text: str(160),
  }),
};

const page = (extra = {}) => z.object({ title: z.string().trim().min(1, 'Page title is required').max(120), intro: str(400), ...extra });
const textPage = page({ body: z.string().max(30000).default('') });
SCHEMAS.pages = z.object({
  about: page({ heading: str(160), image: str(255), body: z.string().max(30000).default('') }),
  faq: page({ items: z.array(z.object({ q: z.string().trim().max(300), a: z.string().trim().max(3000) })).max(60) }),
  contact: page(),
  shipping: textPage,
  returns: textPage,
  privacy: textPage,
  terms: textPage,
});

// Secret gateway fields: an empty value means "keep the stored secret".
const SECRETS = { jazzcash: ['password', 'integrity_salt'], easypaisa: ['hash_key'] };

export const PUT = handler(async (req, { params }) => {
  const { key } = await params;
  const schema = SCHEMAS[key];
  if (!schema) throw new AppError('Unknown settings group', 404);
  await requireAdmin(key === 'homepage' || key === 'pages' ? 'content' : 'settings');
  const value = schema.parse(await readJson(req));

  if (key === 'payments') {
    const current = (await getSettings()).payments;
    for (const [gw, fields] of Object.entries(SECRETS)) {
      for (const f of fields) if (!value[gw][f]) value[gw][f] = current[gw][f] || '';
    }
    if (value.jazzcash.enabled && (!value.jazzcash.merchant_id || !value.jazzcash.password || !value.jazzcash.integrity_salt))
      throw new AppError('Enter JazzCash Merchant ID, Password and Integrity Salt before enabling it.');
    if (value.easypaisa.enabled && (!value.easypaisa.store_id || !value.easypaisa.hash_key))
      throw new AppError('Enter Easypaisa Store ID and Hash Key before enabling it.');
    if (value.easypaisa.hash_key && ![16, 24, 32].includes(Buffer.byteLength(value.easypaisa.hash_key)))
      throw new AppError('Easypaisa Hash Key must be 16, 24 or 32 characters.');
  }
  await saveSetting(key, value);
  return ok({ message: 'Settings saved.' });
});
