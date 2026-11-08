import Icon from '@/components/Icon';
import ContentPage from '@/components/store/content/ContentPage';
import { fillTokens } from '@/components/store/content/RichText';
import { getPages } from '@/lib/pages';

export async function generateMetadata() {
  const { pages, tokens } = await getPages();
  return { title: pages.faq.title, description: fillTokens(pages.faq.intro, tokens) };
}

export default async function FaqPage() {
  const { pages, tokens } = await getPages();
  const page = pages.faq;
  const faqs = page.items.filter((f) => f.q && f.a).map((f) => ({ q: fillTokens(f.q, tokens), a: fillTokens(f.a, tokens) }));
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  };
  return (
    <ContentPage title={page.title} intro={fillTokens(page.intro, tokens)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div className="faq">
        {faqs.map(({ q, a }, i) => (
          <details key={i} open={i === 0}>
            <summary>{q}<Icon name="chevronDown" size={18} /></summary>
            <div style={{ whiteSpace: 'pre-line' }}>{a}</div>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
