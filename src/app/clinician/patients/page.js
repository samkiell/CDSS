/**
 * Patients List Page
 * View and manage all patients assigned to the clinician
 */

export const metadata = {
  title: 'Patient List - CDSS',
};

export default function PatientsPage() {
  // Placeholder data - will be fetched from API
  const patients = [
    {
      id: '1',
      name: 'John Doe',
      age: 45,
      lastVisit: '2026-01-20',
      status: 'pending_review',
      condition: 'Lower Back Pain',
    },
    {
      id: '2',
      name: 'Jane Smith',
      age: 32,
      lastVisit: '2026-01-22',
      status: 'reviewed',
      condition: 'Knee Osteoarthritis',
    },
    {
      id: '3',
      name: 'Robert Johnson',
      age: 58,
      lastVisit: '2026-01-24',
      status: 'in_progress',
      condition: 'Shoulder Pain',
    },
  ];

  const getStatusBadge = (status) => {
    const styles = {
      pending_review: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
    };
    const labels = {
      pending_review: 'Pending Review',
      reviewed: 'Reviewed',
      in_progress: 'In Progress',
    };
    return (
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="mt-2 text-gray-600">
            Manage your assigned patients and their assessments
          </p>
        </div>
        <div className="flex gap-4">
          <input
            type="search"
            placeholder="Search patients..."
            className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select className="rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
            <option value="">All Statuses</option>
            <option value="pending_review">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="in_progress">In Progress</option>
          </select>
        </div>
      </header>

      <div className="overflow-hidden rounded-xl bg-white shadow-md">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Age
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Condition
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Last Visit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {patients.map((patient) => (
              <tr key={patient.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />
                    <div className="ml-4">
                      <div className="font-medium text-gray-900">{patient.name}</div>
                      <div className="text-sm text-gray-500">ID: {patient.id}</div>
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                  {patient.age}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-900">
                  {patient.condition}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-gray-500">
                  {patient.lastVisit}
                </td>
                <td className="whitespace-nowrap px-6 py-4">
                  {getStatusBadge(patient.status)}
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm">
                  <button className="font-medium text-blue-600 hover:text-blue-800">
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
