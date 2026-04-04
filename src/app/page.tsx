import { redirect } from 'next/navigation';

export default function RootPage() {
  // For now, redirect to sziget as the default experience
  // In the future, this will be the Meta Hub landing page
  redirect('/sziget-2026');
}
