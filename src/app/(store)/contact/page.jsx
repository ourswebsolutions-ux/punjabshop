import Icon from '@/components/Icon';
import ContactForm from '@/components/store/content/ContactForm';
import ContentPage from '@/components/store/content/ContentPage';
import { fillTokens } from '@/components/store/content/RichText';
import { whatsappLink } from '@/lib/pakistan';
import { getPages } from '@/lib/pages';

export async function generateMetadata() {
  const { pages, tokens } = await getPages();
  return { title: pages.contact.title, description: fillTokens(pages.contact.intro, tokens) };
}

export default async function ContactPage() {
  const { pages, tokens, settings } = await getPages();
  const { store } = settings;
  return (
    <ContentPage title={pages.contact.title} intro={fillTokens(pages.contact.intro, tokens)} narrow={false}>
      <div className="contact-grid">
        <div className="contact-cards">
          {store.whatsapp && (
            <a className="contact-card" href={whatsappLink(store.whatsapp)} target="_blank" rel="noopener noreferrer">
              <span className="contact-card__icon" style={{ background: '#25d366' }}><Icon name="whatsapp" size={22} /></span>
              <span><small>WhatsApp (fastest)</small><b>{store.whatsapp}</b></span>
            </a>
          )}
          {store.phone && (
            <a className="contact-card" href={`tel:${store.phone.replace(/\s/g, '')}`}>
              <span className="contact-card__icon"><Icon name="phone" size={20} /></span>
              <span><small>Call us</small><b>{store.phone}</b></span>
            </a>
          )}
          {store.email && (
            <a className="contact-card" href={`mailto:${store.email}`}>
              <span className="contact-card__icon"><Icon name="mail" size={20} /></span>
              <span><small>Email</small><b>{store.email}</b></span>
            </a>
          )}
          {store.address &&
            (store.map_link ? (
              <a className="contact-card" href={store.map_link} target="_blank" rel="noopener noreferrer">
                <span className="contact-card__icon"><Icon name="pin" size={20} /></span>
                <span><small>Address – open in Google Maps</small><b>{store.address}</b></span>
              </a>
            ) : (
              <div className="contact-card">
                <span className="contact-card__icon"><Icon name="pin" size={20} /></span>
                <span><small>Address</small><b>{store.address}</b></span>
              </div>
            ))}
          {store.hours && (
            <div className="contact-card">
              <span className="contact-card__icon"><Icon name="clock" size={20} /></span>
              <span><small>Opening hours</small><b>{store.hours}</b></span>
            </div>
          )}
        </div>
        <ContactForm />
      </div>
    </ContentPage>
  );
}
