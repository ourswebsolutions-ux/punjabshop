import Link from 'next/link';
import Icon from '@/components/Icon';
import Logo from '@/components/Logo';
import PaymentLogos from './PaymentLogos';
import { SocialLinks } from './Newsletter';

/** Shows the footer note with any ♥ in red. */
function Note({ text }) {
  return text.split('♥').map((part, i) => (
    <span key={i}>
      {i > 0 && <span className="heart">♥</span>}
      {part}
    </span>
  ));
}

export default function Footer({ store, menu, pages }) {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo variant="light" name={store.name} tagline={store.tagline} image={store.footer_logo} />
          <p className="footer__about">{store.about}</p>
          <SocialLinks social={store.social} className="footer__social" />
        </div>
        <div>
          <h4>Quick Links</h4>
          <ul className="footer__links">
            <li><Link href="/">Home</Link></li>
            {menu.map((c) => (
              <li key={c.id}>
                <Link href={`/category/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li><Link href="/sale">Sale</Link></li>
            <li><Link href="/about">{pages.about}</Link></li>
          </ul>
        </div>
        <div>
          <h4>Customer Care</h4>
          <ul className="footer__links">
            <li><Link href="/faq">{pages.faq}</Link></li>
            <li><Link href="/shipping-policy">{pages.shipping}</Link></li>
            <li><Link href="/return-policy">{pages.returns}</Link></li>
            <li><Link href="/track-order">Track Order</Link></li>
            <li><Link href="/contact">Contact Us</Link></li>
            <li><Link href="/privacy-policy">{pages.privacy}</Link></li>
            <li><Link href="/terms">{pages.terms}</Link></li>
          </ul>
        </div>
        <div className="footer__pay">
          <h4>Payment Methods</h4>
          <PaymentLogos />
          {store.payment_note && <p style={{ fontSize: 13, marginTop: 14, opacity: 0.8 }}>{store.payment_note}</p>}
        </div>
        <div className="footer__contact-col">
          <h4>Contact Us</h4>
          <ul className="footer__contact">
            {store.phone && <li><Icon name="phone" size={18} /><a href={`tel:${store.phone.replace(/\s/g, '')}`}>{store.phone}</a></li>}
            {store.email && <li><Icon name="mail" size={18} /><a href={`mailto:${store.email}`}>{store.email}</a></li>}
            {store.address && (
              <li>
                <Icon name="pin" size={18} />
                {store.map_link ? <a href={store.map_link} target="_blank" rel="noopener noreferrer">{store.address}</a> : store.address}
              </li>
            )}
            {store.hours && <li><Icon name="clock" size={18} />{store.hours}</li>}
          </ul>
        </div>
      </div>
      <div className="footer__bottom">
        <div className="container">
          <span>© {year} {store.name}. All Rights Reserved.</span>
          {store.footer_note && <span><Note text={store.footer_note} /></span>}
        </div>
      </div>
    </footer>
  );
}
