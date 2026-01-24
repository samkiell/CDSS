/**
 * Clinician Portal Layout
 * Shared layout for all clinician-facing routes
 */

export const metadata = {
  title: 'CDSS - Clinician Portal',
  description: 'Clinical Decision Support System - Clinician Dashboard',
};

export default function ClinicianLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Clinician-specific sidebar/header could go here */}
      <main>{children}</main>
    </div>
  );
}
