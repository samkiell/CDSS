import { redirect } from 'next/navigation';
import { auth } from '../../../auth';

export default async function Layout({ children }) {
  const session = await auth();
  if (!session || !session.user) redirect('/login');
  return <div className="bg-background min-h-screen">{children}</div>;
}
