'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  User,
  ClipboardList,
  CheckCircle2,
  FileText,
  PlusCircle,
  Calendar,
  Info,
  Download,
  Eye,
  FileIcon,
  X,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Activity,
  Clock,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Card, Badge, Lightbox, StatusModal } from '@/components/ui';

/**
 * THERAPIST CASE FILE - REDESIGNED
 * ==================================
 * Implements TASK 1-6 for therapist-facing functionality.
 *
 * STRUCTURE (in order):
 * 1. Patient Biodata (Assessment-Scoped)
 * 2. Assessment History (if multiple)
 * 3. Patient Question & Answer Log
 * 4. AI Temporal Diagnosis (Preliminary)
 * 5. Recommended Tests
 * 6. Guided Test Results (if performed)
 */
export default function CaseDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssessmentId, setActiveAssessmentId] = useState(id);
  const [patientAssessments, setPatientAssessments] = useState([]);
  const [recommendedTests, setRecommendedTests] = useState([]);
  const [isLoadingTests, setIsLoadingTests] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    biodata: true,
    history: false,
    qa: true,
    temporal: true,
    tests: true,
    guided: true,
  });

  // Modal states
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    type: 'Physiotherapy Session',
  });
  const [notesData, setNotesData] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    onConfirm: null,
  });

  const showAlert = (title, message, type = 'info', onConfirm = null) => {
    setStatusModal({ isOpen: true, type, title, message, onConfirm });
  };

  useEffect(() => {
    if (id) {
      fetchCaseDetails();
      fetchRecommendedTests();
    }
  }, [id]);

  useEffect(() => {
    if (activeAssessmentId && activeAssessmentId !== id) {
      router.push(`/clinician/cases/${activeAssessmentId}`);
    }
  }, [activeAssessmentId, id, router]);

  const fetchCaseDetails = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}`);
      const result = await res.json();
      if (result.success) {
        setSession(result.data);
        // If recommendedTests are already stored in the session, use them immediately
        if (result.data.recommendedTests?.length > 0) {
          setRecommendedTests(result.data.recommendedTests);
        }
        // Fetch other assessments for this patient
        if (result.data.patientId?._id) {
          fetchPatientAssessments(result.data.patientId._id);
        }
      }
    } catch (err) {
      console.error('Error fetching case details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPatientAssessments = async (patientId) => {
    try {
      const res = await fetch(`/api/diagnosis?patientId=${patientId}`);
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        setPatientAssessments(result.data);
      }
    } catch (err) {
      console.error('Error fetching patient assessments:', err);
    }
  };

  const fetchRecommendedTests = async () => {
    setIsLoadingTests(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}/guided-test`);
      const result = await res.json();
      if (result.success) {
        setRecommendedTests(result.recommendedTests || []);
      }
    } catch (err) {
      console.error('Error fetching recommended tests:', err);
    } finally {
      setIsLoadingTests(false);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: session.patientId._id,
          ...bookingData,
        }),
      });
      if (res.ok) {
        showAlert('Schedule Confirmed', 'Appointment scheduled successfully!', 'success');
        setIsBookingOpen(false);
      } else {
        const err = await res.json();
        showAlert('Scheduling Failed', `Error: ${err.error}`, 'error');
      }
    } catch (err) {
      showAlert('System Error', 'Failed to schedule appointment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateNotes = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/diagnosis/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicianReview: {
            ...session.clinicianReview,
            clinicianNotes: notesData,
          },
        }),
      });
      if (res.ok) {
        showAlert('Notes Saved', 'Case notes updated successfully!', 'success');
        setIsNotesOpen(false);
        fetchCaseDetails();
      } else {
        showAlert('Update Failed', 'Failed to update notes.', 'error');
      }
    } catch (err) {
      showAlert('System Error', 'Internal server error.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p className="text-muted-foreground font-bold">Loading Case File...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-foreground flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertCircle className="text-destructive h-16 w-16 opacity-50" />
        <h2 className="text-2xl font-black">Case File Not Found</h2>
        <p className="text-muted-foreground max-w-md font-medium">
          The session you are looking for does not exist or has been archived.
        </p>
        <Link href="/clinician/cases">
          <Button variant="outline" className="mt-4 rounded-xl border-2 font-bold">
            Back to Case View
          </Button>
        </Link>
      </div>
    );
  }

  const patient = session.patientId;
  const analysis = session.aiAnalysis;
  const biodata = session.biodata;
  const symptomData = session.symptomData || [];
  const guidedResults = session.guidedTestResults;

  return (
    <div className="animate-fade-in text-foreground mx-auto max-w-5xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/clinician/cases')}
            className="bg-card border-border hover:bg-accent rounded-full border p-2 shadow-sm transition-all"
          >
            <ArrowLeft className="text-muted-foreground h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight">
              {patient?.firstName
                ? `${patient.firstName}'s Case File`
                : 'Patient Case File'}
            </h1>
            <div
              className={cn(
                'ml-2 h-3 w-3 animate-pulse rounded-full',
                analysis?.riskLevel === 'Urgent'
                  ? 'bg-destructive'
                  : analysis?.riskLevel === 'Moderate'
                    ? 'bg-warning'
                    : 'bg-success'
              )}
            />
            <span className="text-muted-foreground text-[10px] font-bold tracking-widest uppercase">
              {analysis?.riskLevel || 'Low'} Risk
            </span>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION 1: PATIENT BIODATA (ASSESSMENT-SCOPED)
          ==============================================================
          This displays the biodata snapshot tied to this assessment.
          NOT pulled from patient settings - only from assessment snapshot.
       */}
      <CollapsibleSection
        title="Patient Biodata"
        subtitle="Assessment-scoped snapshot"
        icon={<User className="h-5 w-5" />}
        isExpanded={expandedSections.biodata}
        onToggle={() => toggleSection('biodata')}
      >
        {biodata ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <DataField label="Full Name" value={biodata.fullName} />
            <DataField label="Sex" value={biodata.sex} />
            <DataField label="Age Range" value={biodata.ageRange} />
            <DataField label="Occupation / Working Class" value={biodata.occupation} />
            <DataField label="Educational Background" value={biodata.education} />
            {biodata.notes && (
              <div className="col-span-full">
                <DataField label="Notes" value={biodata.notes} />
              </div>
            )}
            <div className="col-span-full">
              <p className="text-muted-foreground text-xs">
                Confirmed at: {new Date(biodata.confirmedAt).toLocaleString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-6 text-center">
            <p className="text-sm italic">
              No biodata snapshot available for this assessment.
            </p>
            <p className="mt-2 text-xs opacity-75">
              This assessment was created before the biodata snapshot feature was added.
            </p>
          </div>
        )}
      </CollapsibleSection>

      {/* ============================================================
          SECTION 2: ASSESSMENT HISTORY
          ==============================================================
          If patient has multiple assessments, display as chronological list.
          Switching assessments updates all sections below.
       */}
      {patientAssessments.length > 1 && (
        <CollapsibleSection
          title="Assessment History"
          subtitle={`${patientAssessments.length} assessments found`}
          icon={<ClipboardList className="h-5 w-5" />}
          isExpanded={expandedSections.history}
          onToggle={() => toggleSection('history')}
        >
          <div className="space-y-2">
            {patientAssessments.map((assessment) => (
              <button
                key={assessment._id}
                onClick={() => setActiveAssessmentId(assessment._id)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all',
                  assessment._id === id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                )}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold">{assessment.bodyRegion} Assessment</p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(assessment.createdAt).toLocaleDateString()} -{' '}
                      {assessment.aiAnalysis?.temporalDiagnosis || 'Pending analysis'}
                    </p>
                  </div>
                  <Badge
                    className={cn(
                      assessment._id === id && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {assessment._id === id ? 'Viewing' : assessment.status}
                  </Badge>
                </div>
              </button>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {/* ============================================================
          SECTION 3: PATIENT QUESTION & ANSWER LOG
          ==============================================================
          Read-only display of every question asked and patient's response.
          Grouped by region and reflects original flow order.
       */}
      <CollapsibleSection
        title="Patient Question & Answer Log"
        subtitle={`${symptomData.length} responses recorded`}
        icon={<FileText className="h-5 w-5" />}
        isExpanded={expandedSections.qa}
        onToggle={() => toggleSection('qa')}
      >
        {symptomData.length > 0 ? (
          <div className="space-y-4">
            <div className="bg-muted/30 mb-4 rounded-lg p-3">
              <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Region: {session.bodyRegion}
              </p>
            </div>
            {symptomData.map((item, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-xl border p-4',
                  item.effects?.red_flag
                    ? 'border-destructive/30 bg-destructive/5'
                    : 'border-border'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.question}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-primary font-bold">{item.response}</span>
                      {item.effects?.red_flag && (
                        <Badge className="bg-destructive text-destructive-foreground text-xs">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Red Flag
                        </Badge>
                      )}
                    </div>
                    {item.conditionContext && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        Context: {item.conditionContext}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground py-6 text-center">
            <p className="text-sm italic">No Q&A log available for this assessment.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* ============================================================
          SECTION 4: AI TEMPORAL DIAGNOSIS (PRELIMINARY)
          ==============================================================
          Clearly labeled as "Temporal (Preliminary) Diagnosis"
          Includes disclaimer and cannot be edited.
       */}
      <CollapsibleSection
        title="Temporal (Preliminary) Diagnosis"
        subtitle="AI-Assisted • Requires Clinical Validation"
        icon={<Stethoscope className="h-5 w-5" />}
        isExpanded={expandedSections.temporal}
        onToggle={() => toggleSection('temporal')}
      >
        {analysis ? (
          <div className="space-y-6">
            {/* Primary Suspected Condition */}
            <div className="from-primary/10 to-primary/5 rounded-2xl bg-gradient-to-br p-6">
              <p className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                Primary Suspected Condition
              </p>
              <h3 className="text-3xl font-black">{analysis.temporalDiagnosis}</h3>
              <div className="mt-4 flex items-center gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">Confidence</p>
                  <p className="text-xl font-bold">{analysis.confidenceScore}%</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Risk Level</p>
                  <Badge
                    className={cn(
                      analysis.riskLevel === 'Urgent'
                        ? 'bg-destructive'
                        : analysis.riskLevel === 'Moderate'
                          ? 'bg-warning'
                          : 'bg-success'
                    )}
                  >
                    {analysis.riskLevel}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Differential Diagnoses */}
            {analysis.differentialDiagnoses?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                  Differential Diagnoses (Ranked)
                </p>
                <div className="space-y-2">
                  {analysis.differentialDiagnoses.map((diff, index) => (
                    <div
                      key={index}
                      className="border-border flex items-center gap-3 rounded-xl border p-3"
                    >
                      <span className="text-muted-foreground font-bold">
                        #{index + 2}
                      </span>
                      <span className="font-medium">{diff}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {analysis.reasoning?.length > 0 && (
              <div>
                <p className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                  AI Reasoning
                </p>
                <ul className="space-y-2">
                  {analysis.reasoning.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Disclaimer */}
            <div className="bg-warning/10 border-warning/30 rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-warning mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="text-warning-foreground font-bold">
                    Important Disclaimer
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {analysis.disclaimer ||
                      'This diagnosis is AI-assisted and requires clinical validation. It is a preliminary assessment and should not be used as a final diagnosis without physical examination.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground py-6 text-center">
            <p className="text-sm italic">AI analysis pending or unavailable.</p>
          </div>
        )}
      </CollapsibleSection>

      {/* ============================================================
          SECTION 5: RECOMMENDED CLINICAL TESTS
          ==============================================================
          Based on temporal diagnosis, shows suggested physical tests.
          Each test displays: name, associated region, purpose/trigger.
          Test recommendations are immutable - determined by assessment logic.
          Includes prominent "Start Test" button for therapist action.
       */}
      <CollapsibleSection
        title="Recommended Clinical Tests"
        subtitle={`${recommendedTests.length} tests determined from assessment`}
        icon={<Activity className="h-5 w-5" />}
        isExpanded={expandedSections.tests}
        onToggle={() => toggleSection('tests')}
      >
        {isLoadingTests ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
            <span className="text-muted-foreground ml-2">
              Loading recommended tests...
            </span>
          </div>
        ) : recommendedTests.length > 0 ? (
          <div className="space-y-4">
            {/* Tests Summary Header */}
            <div className="bg-primary/5 border-primary/20 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                    Based on Assessment Results
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-bold">{recommendedTests.length}</span> clinical
                    tests recommended for{' '}
                    <span className="font-bold">{session.bodyRegion}</span> region
                  </p>
                </div>
                {analysis?.temporalDiagnosis && (
                  <Badge className="bg-primary/10 text-primary">
                    {analysis.temporalDiagnosis}
                  </Badge>
                )}
              </div>
            </div>

            {/* Test List */}
            <div className="space-y-3">
              {recommendedTests.map((test, index) => (
                <div
                  key={index}
                  className="border-border hover:border-primary/30 rounded-xl border p-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Test Number */}
                    <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold">
                      {index + 1}
                    </div>

                    <div className="flex-1">
                      {/* Test Name */}
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold">{test.name}</h4>
                        {test.isObservation && (
                          <Badge variant="outline" className="text-xs">
                            Observation
                          </Badge>
                        )}
                      </div>

                      {/* Region & Associated Conditions */}
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="bg-muted rounded-md px-2 py-1 font-medium">
                          {session.bodyRegion} Region
                        </span>
                        {test.associatedConditions?.map((condition, ci) => (
                          <span
                            key={ci}
                            className="bg-warning/10 text-warning-foreground rounded-md px-2 py-1"
                          >
                            {condition}
                          </span>
                        ))}
                      </div>

                      {/* Purpose / Instruction */}
                      <p className="text-muted-foreground mt-2 text-sm">
                        <span className="text-foreground font-medium">Purpose: </span>
                        {test.instruction || 'Perform test as per clinical protocol.'}
                      </p>

                      {/* Clinical Implications */}
                      <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                        <div className="bg-success/10 rounded-lg p-2">
                          <p className="text-success flex items-center gap-1 font-bold">
                            <CheckCircle2 className="h-3 w-3" />
                            Positive Finding:
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {test.positiveImplication}
                          </p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-2">
                          <p className="text-destructive flex items-center gap-1 font-bold">
                            <AlertCircle className="h-3 w-3" />
                            Negative Finding:
                          </p>
                          <p className="text-muted-foreground mt-1">
                            {test.negativeImplication}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Start Test Action Button */}
            {!guidedResults?.isLocked ? (
              <div className="border-border mt-6 border-t pt-6">
                <div className="from-primary/10 to-primary/5 rounded-2xl bg-gradient-to-r p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-bold">
                        Ready for Physical Examination
                      </h4>
                      <p className="text-muted-foreground mt-1 text-sm">
                        Proceed through {recommendedTests.length} recommended tests
                        sequentially
                      </p>
                    </div>
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg font-bold shadow-lg transition-all hover:shadow-xl"
                      onClick={() => {
                        // Pass context via URL search params to the unified diagnostic executor
                        const params = new URLSearchParams({
                          caseId: id,
                          patient: patient?.firstName
                            ? `${patient.firstName} ${patient.lastName}`
                            : 'Patient',
                        });

                        // Map region to module slug
                        const regionSlug = session.bodyRegion
                          ?.toLowerCase()
                          .includes('lumbar')
                          ? 'lumbar-pain-screener'
                          : session.bodyRegion?.toLowerCase().includes('shoulder')
                            ? 'shoulder-mobility-screener'
                            : session.bodyRegion?.toLowerCase().includes('cervical')
                              ? 'cervical-posture-diagnostic'
                              : 'ankle-stability-test';

                        router.push(
                          `/clinician/diagnostic/${regionSlug}?${params.toString()}`
                        );
                      }}
                    >
                      <Stethoscope className="mr-2 h-6 w-6" />
                      Start Test
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-border mt-4 border-t pt-4">
                <div className="bg-success/10 flex items-center gap-3 rounded-xl p-4">
                  <CheckCircle2 className="text-success h-5 w-5" />
                  <div>
                    <p className="text-success font-bold">Guided Tests Completed</p>
                    <p className="text-muted-foreground text-sm">
                      See results in the Clinician-Guided Diagnostic Outcome section
                      below.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-muted-foreground py-8 text-center">
            <Activity className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p className="text-sm font-medium">
              No recommended tests found for this assessment.
            </p>
            <p className="mt-2 text-xs opacity-75">
              Tests are determined by the assessment engine based on patient responses and
              clinical rules.
            </p>
            {/* Disabled Start Test button when no tests */}
            <Button size="lg" className="mt-6 h-14 px-8" disabled>
              <Stethoscope className="mr-2 h-5 w-5" />
              Start Test
            </Button>
          </div>
        )}
      </CollapsibleSection>

      {/* ============================================================
          SECTION 6: CLINICIAN-GUIDED DIAGNOSTIC OUTCOME
          ==============================================================
          Shows results if guided testing has been completed.
          Coexists with AI temporal diagnosis - neither overwrites.
       */}
      {guidedResults && (
        <CollapsibleSection
          title="Clinician-Guided Diagnostic Outcome"
          subtitle={guidedResults.isLocked ? 'Completed' : 'In Progress'}
          icon={<CheckCircle2 className="h-5 w-5" />}
          isExpanded={expandedSections.guided}
          onToggle={() => toggleSection('guided')}
        >
          <div className="space-y-6">
            {/* Tests Performed */}
            <div>
              <p className="text-muted-foreground mb-3 text-xs font-bold tracking-wider uppercase">
                Tests Performed ({guidedResults.tests?.length || 0})
              </p>
              <div className="space-y-2">
                {guidedResults.tests?.map((test, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between rounded-xl border p-3',
                      test.result === 'positive'
                        ? 'border-success/30 bg-success/5'
                        : test.result === 'negative'
                          ? 'border-destructive/30 bg-destructive/5'
                          : 'border-border'
                    )}
                  >
                    <div>
                      <p className="font-medium">{test.testName}</p>
                      {test.notes && (
                        <p className="text-muted-foreground text-xs">{test.notes}</p>
                      )}
                    </div>
                    <Badge
                      className={cn(
                        test.result === 'positive'
                          ? 'bg-success'
                          : test.result === 'negative'
                            ? 'bg-destructive'
                            : 'bg-muted'
                      )}
                    >
                      {test.result}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Refined Diagnosis */}
            {guidedResults.refinedDiagnosis && (
              <div className="from-success/10 to-success/5 rounded-2xl bg-gradient-to-br p-6">
                <p className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                  Final Suspected Condition
                </p>
                <h3 className="text-3xl font-black">
                  {guidedResults.refinedDiagnosis.finalSuspectedCondition ||
                    'Undetermined'}
                </h3>

                {guidedResults.refinedDiagnosis.ruledOutConditions?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                      Ruled Out
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {guidedResults.refinedDiagnosis.ruledOutConditions.map((c, i) => (
                        <Badge key={i} className="bg-destructive/10 text-destructive">
                          {c}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-muted-foreground mt-4 text-xs">
                  Completed:{' '}
                  {guidedResults.completedAt
                    ? new Date(guidedResults.completedAt).toLocaleString()
                    : 'N/A'}
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-14" onClick={() => setIsBookingOpen(true)}>
          <Calendar className="mr-2 h-5 w-5" />
          Schedule Session
        </Button>
        <Button
          variant="outline"
          className="h-14"
          onClick={() => {
            setNotesData(session.clinicianReview?.clinicianNotes || '');
            setIsNotesOpen(true);
          }}
        >
          <FileText className="mr-2 h-5 w-5" />
          Add Notes
        </Button>
        <Button
          variant="outline"
          className="h-14"
          onClick={() => router.push(`/clinician/treatment?patientId=${patient?._id}`)}
        >
          <PlusCircle className="mr-2 h-5 w-5" />
          Treatment Plan
        </Button>
      </div>

      {/* Booking Modal */}
      {isBookingOpen && (
        <ModalOverlay onClose={() => setIsBookingOpen(false)}>
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-black">Schedule Appointment</h3>
            <form onSubmit={handleBook} className="mt-6 space-y-4">
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase">
                  Date
                </label>
                <input
                  type="date"
                  required
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                  value={bookingData.date}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, date: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-muted-foreground text-xs font-bold uppercase">
                  Time
                </label>
                <input
                  type="time"
                  required
                  className="mt-1 w-full rounded-xl border p-3 text-sm"
                  value={bookingData.time}
                  onChange={(e) =>
                    setBookingData({ ...bookingData, time: e.target.value })
                  }
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsBookingOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Scheduling...' : 'Confirm'}
                </Button>
              </div>
            </form>
          </Card>
        </ModalOverlay>
      )}

      {/* Notes Modal */}
      {isNotesOpen && (
        <ModalOverlay onClose={() => setIsNotesOpen(false)}>
          <Card className="w-full max-w-md p-6">
            <h3 className="text-xl font-black">Add Clinical Notes</h3>
            <form onSubmit={handleUpdateNotes} className="mt-6 space-y-4">
              <textarea
                className="h-40 w-full rounded-xl border p-4 text-sm"
                placeholder="Type clinician notes here..."
                value={notesData}
                onChange={(e) => setNotesData(e.target.value)}
                required
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNotesOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : 'Save Notes'}
                </Button>
              </div>
            </form>
          </Card>
        </ModalOverlay>
      )}

      {/* Status Modal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        type={statusModal.type}
        title={statusModal.title}
        message={statusModal.message}
        onClose={() => setStatusModal((s) => ({ ...s, isOpen: false }))}
        onConfirm={statusModal.onConfirm}
      />
    </div>
  );
}

/**
 * COLLAPSIBLE SECTION COMPONENT
 * ==============================
 * Reusable expandable section for case file organization.
 */
function CollapsibleSection({ title, subtitle, icon, isExpanded, onToggle, children }) {
  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="hover:bg-accent/50 flex w-full items-center justify-between p-6 text-left transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary rounded-full p-2">{icon}</div>
          <div>
            <h2 className="text-lg font-black">{title}</h2>
            {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
          </div>
        </div>
        {isExpanded ? (
          <ChevronDown className="text-muted-foreground h-5 w-5" />
        ) : (
          <ChevronRight className="text-muted-foreground h-5 w-5" />
        )}
      </button>
      {isExpanded && <div className="border-border border-t p-6">{children}</div>}
    </Card>
  );
}

/**
 * DATA FIELD COMPONENT
 * =====================
 * Simple labeled data display.
 */
function DataField({ label, value }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
        {label}
      </p>
      <p className="mt-1 font-semibold">{value || 'N/A'}</p>
    </div>
  );
}

/**
 * MODAL OVERLAY COMPONENT
 * ========================
 * Reusable modal backdrop.
 */
function ModalOverlay({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="animate-scale-up">{children}</div>
    </div>
  );
}
