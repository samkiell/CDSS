/**
 * SELF-GUIDED TEST - FEATURE DEPRECATED
 * =====================================
 * This feature has been removed from the patient dashboard.
 *
 * The "New Assessment" flow (/patient/assessment?new=true) is now the
 * ONLY way patients can begin clinical assessments.
 *
 * This page now redirects patients back to their dashboard.
 * Historical self-test data is preserved in the database.
 */

import { redirect } from 'next/navigation';

export default function SelfTestPage() {
  // Redirect patients attempting to access this deprecated feature
  redirect('/patient/dashboard');
}
