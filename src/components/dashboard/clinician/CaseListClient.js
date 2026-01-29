'use client';
import { useState } from 'react';
import SearchPaitent from './search';
import PatientInfoContainer from './paitentContainer';

export default function CaseListClient({ initialPatients }) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <>
      <SearchPaitent searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <div className="space-y-4">
        <PatientInfoContainer
          patients={initialPatients}
          searchQuery={searchQuery}
          url={'/clinician/cases'}
        />
      </div>
    </>
  );
}
