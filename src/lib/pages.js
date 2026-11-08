import 'server-only';
import { formatPrice } from './format';
import { mergePages } from './pages-content';
import { getSettings } from './settings';

/** Information pages with the values for their {words}. */
export async function getPages() {
  const settings = await getSettings();
  const { store, shipping } = settings;
  const cityFees = Object.entries(shipping.city_fees || {});
  const tokens = {
    store: store.name,
    tagline: store.tagline,
    phone: store.phone,
    whatsapp: store.whatsapp,
    email: store.email,
    address: store.address,
    hours: store.hours,
    delivery_time: shipping.estimated_days,
    delivery_fee: Number(shipping.flat_fee) > 0 ? formatPrice(shipping.flat_fee) : 'FREE',
    free_delivery_above: Number(shipping.free_threshold) > 0 ? formatPrice(shipping.free_threshold) : '',
    cod_fee: Number(shipping.cod_fee) > 0 ? formatPrice(shipping.cod_fee) : '',
    city_delivery_fees: cityFees.map(([city, fee]) => `- ${city}: ${formatPrice(fee)}`).join('\n'),
  };
  return { pages: mergePages(settings.pages), tokens, settings };
}
