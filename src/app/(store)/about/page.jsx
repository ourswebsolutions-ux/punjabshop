import Image from 'next/image';
import Link from 'next/link';
import Icon from '@/components/Icon';
import ContentPage from '@/components/store/content/ContentPage';
import RichText, { fillTokens } from '@/components/store/content/RichText';
import { queryOne } from '@/lib/db';
import { getPages } from '@/lib/pages';

export async function generateMetadata() {
  const { pages, tokens } = await getPages();
  return { title: pages.about.title, description: fillTokens(pages.about.intro, tokens) };
}

export default async function AboutPage() {
  const { pages, tokens, settings } = await getPages();
  const page = pages.about;
  const fallback = page.image ? null : await queryOne("SELECT image FROM categories WHERE status = 'active' AND image IS NOT NULL ORDER BY show_on_home DESC, sort_order LIMIT 1");
  const image = page.image || fallback?.image;
  return (
    <ContentPage title={page.title} intro={fillTokens(page.intro, tokens)} narrow={false}>
      <div className="about-hero">
        <div>
          {page.heading && <h2 style={{ fontSize: 26, marginBottom: 14 }}>{fillTokens(page.heading, tokens)}</h2>}
          <RichText text={page.body} tokens={tokens} />
          <div style={{ display: 'flex', gap: 10, marginTop: 20, flexWrap: 'wrap' }}>
            <Link href="/shop" className="btn btn--primary">Shop the collection <Icon name="arrowRight" size={18} className="arrow" /></Link>
            <Link href="/contact" className="btn btn--outline">Contact us</Link>
          </div>
        </div>
        {image && (
          <div className="about-hero__img">
            <Image src={image} alt="" fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
        )}
      </div>
      <div className="features" style={{ marginTop: 40 }}>
        {settings.homepage.features.map((f, i) => (
          <div className="feature" key={i}>
            <Icon name={f.icon} size={34} className="feature__icon" />
            <div><div className="feature__title">{f.title}</div><div className="feature__text">{f.text}</div></div>
          </div>
        ))}
      </div>
    </ContentPage>
  );
}
