// Editable information pages (About, FAQ, policies, contact intro).
// Text format: a blank line starts a new paragraph, "## " starts a heading,
// "- " starts a bullet point. Words in {curly brackets} are filled in from
// Store Settings, and a line whose filled-in value is empty is left out.

export const PAGE_KEYS = ['about', 'faq', 'contact', 'shipping', 'returns', 'privacy', 'terms'];

export const PAGE_INFO = {
  about: { label: 'About Us', path: '/about' },
  faq: { label: 'FAQ', path: '/faq' },
  contact: { label: 'Contact Us', path: '/contact' },
  shipping: { label: 'Delivery Policy', path: '/shipping-policy' },
  returns: { label: 'Return Policy', path: '/return-policy' },
  privacy: { label: 'Privacy Policy', path: '/privacy-policy' },
  terms: { label: 'Terms & Conditions', path: '/terms' },
};

export const PAGE_TOKENS = [
  ['store', 'your shop name'],
  ['tagline', 'your tagline'],
  ['phone', 'phone number'],
  ['whatsapp', 'WhatsApp number'],
  ['email', 'email'],
  ['address', 'shop address'],
  ['hours', 'opening hours'],
  ['delivery_time', 'how long delivery takes'],
  ['delivery_fee', 'delivery charge'],
  ['free_delivery_above', 'free delivery amount'],
  ['cod_fee', 'cash on delivery charge'],
  ['city_delivery_fees', 'list of city delivery charges'],
];

export const PAGE_DEFAULTS = {
  about: {
    title: 'About Us',
    intro: '{store} – {tagline}.',
    heading: 'Premium footwear for every step',
    image: '',
    body: `{store} started with a simple idea: everyone in Pakistan deserves stylish, comfortable and long-lasting shoes at a fair price, delivered right to their doorstep. From everyday sneakers and sports shoes to elegant heels, handcrafted formal shoes and traditional chappals, we carefully select every pair for quality and comfort.

We deliver to every city in Pakistan with Cash on Delivery, easy 7-day exchanges and a friendly support team that is always a WhatsApp message away.`,
  },
  faq: {
    title: 'Frequently Asked Questions',
    intro: 'Quick answers to the questions we hear most.',
    items: [
      { q: 'How long does delivery take?', a: 'Orders are delivered all over Pakistan within {delivery_time}. Major cities usually receive orders sooner.' },
      { q: 'How much is the delivery charge?', a: 'Delivery is {delivery_fee} per order. Orders above {free_delivery_above} get FREE delivery.' },
      { q: 'Do you offer Cash on Delivery?', a: 'Yes! Cash on Delivery is available in all cities. You pay the rider when you receive your parcel.' },
      { q: 'Which online payment methods do you accept?', a: 'Depending on availability you can pay with JazzCash, Easypaisa or direct bank transfer. Online payments are confirmed only after they are verified.' },
      { q: 'How do I choose the right size?', a: 'Our sizes are in EU numbering. If you are between sizes we recommend going one size up. You can also message us on WhatsApp at {whatsapp} for help.' },
      { q: 'Can I exchange or return my shoes?', a: 'Yes, unworn items in original packaging can be exchanged or returned within 7 days of delivery. See our Return Policy for details.' },
      { q: 'How can I track my order?', a: 'Use the Track Order page with your order number and mobile number, or log in to your account to see all your orders.' },
      { q: 'Can I cancel my order?', a: 'You can cancel any time before it is shipped by contacting us on WhatsApp ({whatsapp}) or phone ({phone}).' },
    ],
  },
  contact: {
    title: 'Contact Us',
    intro: 'We’re here to help with orders, sizes, exchanges and anything else.',
  },
  shipping: {
    title: 'Shipping Policy',
    intro: 'Delivery all over Pakistan.',
    body: `## Delivery time
Orders are dispatched within 1–2 working days and delivered within {delivery_time}.

## Delivery charges
- Standard delivery: {delivery_fee} per order.
- FREE delivery on orders above {free_delivery_above}.
- Cash on Delivery handling: {cod_fee}.
{city_delivery_fees}

## Order tracking
Once shipped, you’ll receive the courier name and tracking number, which you can also see on the Track Order page.`,
  },
  returns: {
    title: 'Return & Refund Policy',
    intro: 'Easy 7-day exchanges and returns.',
    body: `## Eligibility
- Requests must be made within 7 days of delivery.
- Items must be unworn, clean and in original packaging with tags.
- Sale items can be exchanged for size but are not eligible for cash refunds unless defective.

## How to request
Message us on WhatsApp ({whatsapp}) or email {email} with your order number, the item and the reason. We’ll arrange a pickup or share the return address.

## Exchanges
Size exchanges are free the first time. We ship the replacement as soon as the returned item is received and checked.

## Refunds
Approved refunds are issued within 5–7 working days via bank transfer, JazzCash or Easypaisa. Original delivery charges are non-refundable unless the item was defective or incorrect.

## Damaged or wrong items
If you receive a damaged or incorrect item, contact us within 48 hours with photos and we’ll replace it at no cost.`,
  },
  privacy: {
    title: 'Privacy Policy',
    intro: 'How we collect, use and protect your information.',
    body: `This policy explains how {store} handles the personal information you share with us when you visit our website or place an order.

## Information we collect
- Contact details such as your name, mobile number, email address and delivery address.
- Order details including the products you purchase and your payment method.
- Account information if you register, including a securely protected password.
- Basic technical data such as cookies required for your cart and login session.

## How we use your information
- To process, confirm, deliver and support your orders.
- To contact you about your order by phone, SMS, WhatsApp or email.
- To send offers and updates if you subscribe to our newsletter (you can unsubscribe at any time).
- To prevent fraud and keep our store secure.

## Sharing
We share only what is necessary with courier companies to deliver your order and with payment providers (JazzCash, Easypaisa or banks) to process payments. We never sell your personal data.

## Payments
Online payments are processed on the secure pages of the payment provider. We do not store your wallet PIN, card numbers or banking passwords.

## Your choices
You can view and update your account details at any time, or contact us at {email} to request deletion of your data.

## Contact
Questions about this policy? Email {email} or call {phone}.`,
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'Please read these terms carefully before using {store}.',
    body: `## Orders
All orders are subject to availability and confirmation. We may call you to verify Cash on Delivery orders before dispatch. We reserve the right to cancel orders that cannot be verified or that contain pricing errors.

## Pricing
All prices are in Pakistani Rupees (PKR) and include applicable taxes. Delivery charges are shown at checkout. Prices and promotions may change without notice but will not affect orders already confirmed.

## Payments
We accept Cash on Delivery and, where enabled, JazzCash, Easypaisa and bank transfer. Online payments are considered complete only once verified by us or the payment provider.

## Delivery
Delivery timelines are estimates. Please inspect your parcel on delivery and contact us within 48 hours about any damage or missing items.

## Returns
Returns and exchanges are governed by our Return & Refund Policy.

## Accounts
You are responsible for keeping your login details confidential. We may suspend accounts involved in fraud or abuse.

## Contact
For any questions, contact {email} or {phone}.`,
  },
};

/** Saved page content merged over the defaults. */
export function mergePages(saved = {}) {
  const out = {};
  for (const key of PAGE_KEYS) out[key] = { ...PAGE_DEFAULTS[key], ...(saved[key] || {}) };
  return out;
}
