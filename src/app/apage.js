import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the public splash page
  redirect('/clinician/dashboard');
}

// Note: This file exists to handle the root route.
// The actual splash page is at src/app/(public)/page.js
