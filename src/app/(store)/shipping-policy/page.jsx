import ContentPage from '@/components/store/content/ContentPage';
import RichText, { fillTokens } from '@/components/store/content/RichText';
import { getPages } from '@/lib/pages';

export async function generateMetadata() {
  const { pages, tokens } = await getPages();
  return { title: pages.shipping.title, description: fillTokens(pages.shipping.intro, tokens) };
}

export default async function Page() {
  const { pages, tokens } = await getPages();
  const page = pages.shipping;
  return (
    <ContentPage title={page.title} intro={fillTokens(page.intro, tokens)}>
      <RichText text={page.body} tokens={tokens} />
    </ContentPage>
  );
}
