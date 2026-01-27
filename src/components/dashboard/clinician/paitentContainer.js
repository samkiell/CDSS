import PaitentInfoCard from '@/components/dashboard/clinician/paitentCard';
export default function PatientInfoContainer({
  patients,
  searchQuery,
  url,
  buttonLabel,
}) {
  const filteredPatients = patients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <>
      {patients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <img
            src="/doctor-files-medical-svgrepo-com.svg"
            alt="No patient cases"
            className="mb-6 h-32 w-32 text-gray-300 sm:h-40 sm:w-40 dark:text-gray-600"
          />
          <p className="text-center text-sm font-medium text-gray-600 sm:text-base dark:text-gray-400">
            No Patient Case File Has Been Assigned To You
          </p>
        </div>
      )}
      {filteredPatients.length > 0 ? (
        filteredPatients.map((patient, idx) => {
          return (
            <PaitentInfoCard
              patient={patient}
              key={idx}
              url={url}
              buttonLabel={buttonLabel}
            />
          );
        })
      ) : (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20">
          <img
            src="/doctor-files-medical-svgrepo-com.svg"
            alt="No patient cases"
            className="mb-6 h-32 w-32 text-gray-300 sm:h-40 sm:w-40 dark:text-gray-600"
          />
          <p className="text-center text-sm font-medium text-gray-600 sm:text-base dark:text-gray-400">
            No Patient with this Name.
          </p>
        </div>
      )}
    </>
  );
}
