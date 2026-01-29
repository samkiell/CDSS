import { NotFoundClient } from '@/components/ui/NotFoundClient';

export const metadata = {
  title: '404 - Page Not Found | CDSS',
  description: 'The page you are looking for does not exist or has been moved.',
};

export default function NotFound() {
  return <NotFoundClient />;
}
