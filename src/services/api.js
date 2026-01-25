// Mock data for cases
const MOCK_CASES = [
  {
    id: 'case-001',
    patientName: 'John Doe',
    patientId: 'P-2024-001',
    status: 'NEW',
    completeness: 100,
    submittedAt: '2024-01-24T10:30:00Z',
    lastUpdated: '2024-01-24T10:30:00Z',
    priority: 'HIGH',
  },
  {
    id: 'case-002',
    patientName: 'Jane Smith',
    patientId: 'P-2024-002',
    status: 'IN_PROGRESS',
    completeness: 85,
    submittedAt: '2024-01-23T14:15:00Z',
    lastUpdated: '2024-01-24T09:45:00Z',
    priority: 'MEDIUM',
  },
  {
    id: 'case-003',
    patientName: 'Robert Johnson',
    patientId: 'P-2024-003',
    status: 'AWAITING_INPUT',
    completeness: 60,
    submittedAt: '2024-01-22T08:00:00Z',
    lastUpdated: '2024-01-23T11:20:00Z',
    priority: 'LOW',
  },
  {
    id: 'case-004',
    patientName: 'Emily Davis',
    patientId: 'P-2024-004',
    status: 'READY_FOR_REVIEW',
    completeness: 100,
    submittedAt: '2024-01-21T16:45:00Z',
    lastUpdated: '2024-01-24T13:00:00Z',
    priority: 'MEDIUM',
  },
  {
    id: 'case-005',
    patientName: 'Michael Brown',
    patientId: 'P-2024-005',
    status: 'NEW',
    completeness: 100,
    submittedAt: '2024-01-25T01:00:00Z',
    lastUpdated: '2024-01-25T01:00:00Z',
    priority: 'HIGH',
  },
];

/**
 * Valid statuses for a case
 */
export const CASE_STATUS = {
  NEW: 'NEW',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_INPUT: 'AWAITING_INPUT',
  READY_FOR_REVIEW: 'READY_FOR_REVIEW',
};

/**
 * Fetches assigned cases for the logged-in clinician.
 * Simulates an API call with a delay.
 *
 * @param {string} clinicianId - The ID of the clinician (optional for mock)
 * @returns {Promise<Array>} Array of case objects
 */
export async function getAssignedCases(clinicianId = 'CLINICIAN-001') {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return mock data sorted by date (newest first)
  return [...MOCK_CASES].sort(
    (a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated)
  );
}

/**
 * Fetches a single case by ID.
 *
 * @param {string} caseId - The ID of the case to fetch
 * @returns {Promise<Object|null>} Case object or null if not found
 */
export async function getCaseById(caseId) {
  await new Promise((resolve) => setTimeout(resolve, 500));
  const foundCase = MOCK_CASES.find((c) => c.id === caseId);
  return foundCase || null;
}
