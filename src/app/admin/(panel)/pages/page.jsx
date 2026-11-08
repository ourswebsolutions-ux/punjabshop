import PagesManager from '@/components/admin/PagesManager';
import { pageAdmin } from '@/lib/admin';
import { mergePages } from '@/lib/pages-content';
import { getSettings } from '@/lib/settings';

export const metadata = { title: 'Pages' };

export default async function PagesAdmin() {
  await pageAdmin('content');
  const settings = await getSettings();
  return <PagesManager initial={mergePages(settings.pages)} />;
}
