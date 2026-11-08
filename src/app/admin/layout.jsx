import './admin.css';

export const metadata = { title: { default: 'Admin', template: '%s | PunjabShoes Admin' }, robots: { index: false, follow: false } };

export default function AdminRootLayout({ children }) {
  return children;
}
