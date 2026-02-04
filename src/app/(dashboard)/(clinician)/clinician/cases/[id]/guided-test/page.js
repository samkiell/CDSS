'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  SkipForward,
  Loader2,
  AlertTriangle,
  Stethoscope,
  Activity,
  ChevronRight,
  ClipboardList,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import { Button, Card, Badge } from '@/components/ui';
import { toast } from 'sonner';

/**
 * GUIDED DIAGNOSIS TEST PAGE
 * ===========================
 * Implements TASK 3: Therapist-guided physical testing engine.
 *
 * FLOW:
 * 1. Load recommended tests based on temporal diagnosis
 * 2. Present tests one at a time
 * 3. Therapist records Positive / Negative / Skip
 * 4. Results rule in or rule out conditions
 * 5. Stop when diagnostic clarity reached or no tests remain
 *
 * CONTEXT-DRIVEN ENTRY:
 * - Accepts context from case file via URL search params
 * - assessmentId, patientId, region, testCount
 * - Initializes directly into recommended test flow
 *
 * CONSTRAINTS:
 * - Results are immutable once saved
 * - All actions are fully traceable
 * - Do NOT require therapists to perform all tests
 */
export default function GuidedTestPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Context from case file (passed via URL params)
  const contextRegion = searchParams.get('region');
  const contextPatientId = searchParams.get('patientId');
  const contextTestCount = searchParams.get('testCount');

  const [isLoading, setIsLoading] = useState(true);
  const [assessmentData, setAssessmentData] = useState(null);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [completedTests, setCompletedTests] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [testNotes, setTestNotes] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [refinedDiagnosis, setRefinedDiagnosis] = useState(null);

  useEffect(() => {
    if (id) {
      fetchTestData();
    }
  }, [id]);

  const fetchTestData = async () => {
    setIsLoading(true);
    try {
      // Pass context to API for proper initialization
      const queryParams = new URLSearchParams();
      if (contextRegion) queryParams.set('region', contextRegion);
      if (contextPatientId) queryParams.set('patientId', contextPatientId);

      const url = `/api/diagnosis/${id}/guided-test${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const res = await fetch(url);
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error || 'Failed to load test data');
        router.push(`/clinician/cases/${id}`);
        return;
      }

      if (result.isLocked) {
        toast.info('Guided tests already completed for this assessment.');
        router.push(`/clinician/cases/${id}`);
        return;
      }

      // Validate that we have tests to perform
      if (!result.recommendedTests || result.recommendedTests.length === 0) {
        toast.warning('No recommended tests available for this assessment.');
        router.push(`/clinician/cases/${id}`);
        return;
      }

      setAssessmentData(result);

      // Load existing completed tests if resuming
      if (result.guidedTestResults?.tests?.length > 0) {
        setCompletedTests(result.guidedTestResults.tests);
        setCurrentTestIndex(result.guidedTestResults.tests.length);
      }

      // Show initialization message with context
      if (contextRegion) {
        toast.success(`Initialized for ${contextRegion} region assessment`);
      }
    } catch (err) {
      console.error('Error loading test data:', err);
      toast.error('Failed to load test data');
    } finally {
      setIsLoading(false);
    }
  };

  const recordResult = async (result) => {
    if (isRecording || !assessmentData) return;

    const currentTest = assessmentData.recommendedTests[currentTestIndex];
    if (!currentTest) return;

    setIsRecording(true);

    try {
      const res = await fetch(`/api/diagnosis/${id}/guided-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testName: currentTest.name,
          result,
          notes: testNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to record result');
      }

      // Add to local state
      const newTest = {
        testName: currentTest.name,
        result,
        notes: testNotes,
        timestamp: new Date().toISOString(),
      };
      setCompletedTests((prev) => [...prev, newTest]);
      setTestNotes('');

      // Check if we should stop
      const remainingTests =
        assessmentData.recommendedTests.length - (currentTestIndex + 1);
      const positiveCount = [...completedTests, newTest].filter(
        (t) => t.result === 'positive'
      ).length;
      const negativeCount = [...completedTests, newTest].filter(
        (t) => t.result === 'negative'
      ).length;

      // Diagnostic clarity threshold: 2+ positive tests confirm, or 2+ negative + 1 positive
      const diagnosticClarity =
        positiveCount >= 2 || (negativeCount >= 2 && positiveCount >= 1);

      if (diagnosticClarity) {
        toast.success('Diagnostic clarity reached!');
        setIsComplete(true);
      } else if (remainingTests <= 0) {
        toast.info('All tests completed.');
        setIsComplete(true);
      } else {
        // Move to next test
        setCurrentTestIndex((prev) => prev + 1);
        toast.success(`Recorded: ${currentTest.name} - ${result.toUpperCase()}`);
      }
    } catch (err) {
      console.error('Error recording result:', err);
      toast.error(err.message || 'Failed to record result');
    } finally {
      setIsRecording(false);
    }
  };

  const completeGuidedTest = async () => {
    if (isCompleting) return;

    setIsCompleting(true);

    try {
      const res = await fetch(`/api/diagnosis/${id}/guided-test`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'complete' }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to complete test flow');
      }

      setRefinedDiagnosis(data.refinedDiagnosis);
      toast.success('Guided test flow completed!');
    } catch (err) {
      console.error('Error completing test flow:', err);
      toast.error(err.message || 'Failed to complete test flow');
    } finally {
      setIsCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="text-primary h-12 w-12 animate-spin" />
        <p className="text-muted-foreground font-bold">Loading Guided Tests...</p>
      </div>
    );
  }

  if (!assessmentData) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle className="text-destructive h-16 w-16" />
        <p className="text-muted-foreground font-bold">Failed to load test data</p>
        <Button onClick={() => router.push(`/clinician/cases/${id}`)}>
          Back to Case File
        </Button>
      </div>
    );
  }

  const currentTest = assessmentData.recommendedTests[currentTestIndex];
  const totalTests = assessmentData.recommendedTests.length;
  const hasTests = totalTests > 0;

  // Show completion screen
  if (isComplete || refinedDiagnosis) {
    return (
      <div className="animate-fade-in mx-auto max-w-3xl space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/clinician/cases/${id}`)}
            className="bg-card border-border hover:bg-accent rounded-full border p-2 shadow-sm transition-all"
          >
            <ArrowLeft className="text-muted-foreground h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Guided Diagnosis Complete
            </h1>
            <p className="text-muted-foreground text-sm">
              {assessmentData.patientName} • {assessmentData.region || contextRegion}
            </p>
          </div>
        </div>

        {/* Assessment Context Card */}
        <Card className="border-primary/20 bg-primary/5 p-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <ClipboardList className="text-primary h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Assessment ID</p>
                <p className="font-mono text-xs font-bold">{id.slice(-8)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Target className="text-primary h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Region</p>
                <p className="font-bold">{assessmentData.region || contextRegion}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="text-primary h-4 w-4" />
              <div>
                <p className="text-muted-foreground text-xs">Tests Performed</p>
                <p className="font-bold">{completedTests.length}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Refined Diagnosis */}
        {refinedDiagnosis ? (
          <Card className="p-8">
            <div className="mb-8 text-center">
              <div className="bg-success/10 mb-4 inline-flex items-center justify-center rounded-full p-4">
                <CheckCircle2 className="text-success h-12 w-12" />
              </div>
              <h2 className="text-xl font-black">Clinician-Guided Diagnostic Outcome</h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Based on {completedTests.length} physical tests performed
              </p>
            </div>

            <div className="from-success/10 to-success/5 mb-6 rounded-2xl bg-gradient-to-br p-6">
              <p className="text-muted-foreground mb-2 text-xs font-bold tracking-wider uppercase">
                Final Suspected Condition
              </p>
              <h3 className="text-3xl font-black">
                {refinedDiagnosis.finalSuspectedCondition || 'Undetermined'}
              </h3>
            </div>

            {/* Test Summary */}
            <div className="space-y-4">
              <h4 className="font-bold">Tests Performed</h4>
              {completedTests.map((test, index) => (
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
                  <span className="font-medium">{test.testName}</span>
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

            <Button
              size="lg"
              className="mt-8 h-14 w-full"
              onClick={() => router.push(`/clinician/cases/${id}`)}
            >
              Return to Case File
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Card>
        ) : (
          <Card className="p-8 text-center">
            <h2 className="mb-4 text-xl font-black">Ready to Complete</h2>
            <p className="text-muted-foreground mb-6">
              You have recorded {completedTests.length} test results. Click below to
              generate the refined diagnosis.
            </p>

            {/* Test Summary */}
            <div className="mb-6 space-y-2">
              {completedTests.map((test, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center justify-between rounded-xl border p-3 text-left',
                    test.result === 'positive'
                      ? 'border-success/30 bg-success/5'
                      : test.result === 'negative'
                        ? 'border-destructive/30 bg-destructive/5'
                        : 'border-border'
                  )}
                >
                  <span className="font-medium">{test.testName}</span>
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

            <Button
              size="lg"
              className="h-14 w-full"
              onClick={completeGuidedTest}
              disabled={isCompleting}
            >
              {isCompleting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Diagnosis...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Complete & Generate Diagnosis
                </>
              )}
            </Button>
          </Card>
        )}
      </div>
    );
  }

  // Show current test
  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push(`/clinician/cases/${id}`)}
            className="bg-card border-border hover:bg-accent rounded-full border p-2 shadow-sm transition-all"
          >
            <ArrowLeft className="text-muted-foreground h-6 w-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Guided Diagnosis Test</h1>
            <p className="text-muted-foreground text-sm">
              {assessmentData.patientName} • {assessmentData.region || contextRegion}
            </p>
          </div>
        </div>
        {completedTests.length > 0 && (
          <Button variant="outline" onClick={() => setIsComplete(true)}>
            Complete Early
          </Button>
        )}
      </div>

      {/* Context Summary Card */}
      <Card className="border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-primary h-5 w-5" />
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">
                AI Temporal Diagnosis
              </p>
              <p className="font-bold">{assessmentData.temporalDiagnosis}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs font-bold uppercase">
              Region
            </p>
            <Badge className="bg-primary/10 text-primary">
              {assessmentData.region || contextRegion}
            </Badge>
          </div>
        </div>
        {assessmentData.differentialDiagnoses?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <p className="text-muted-foreground text-xs mb-2">Differential Diagnoses:</p>
            <div className="flex flex-wrap gap-2">
              {assessmentData.differentialDiagnoses.map((diff, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {diff}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Test {currentTestIndex + 1} of {totalTests}
          </span>
          <span className="font-bold">{completedTests.length} recorded</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="bg-primary h-full transition-all duration-500"
            style={{ width: `${((currentTestIndex + 1) / totalTests) * 100}%` }}
          />
        </div>
      </div>

      {/* Current Test */}
      {currentTest ? (
        <Card className="p-6">
          <div className="mb-6 flex items-start gap-4">
            <div className="bg-primary/10 text-primary rounded-full p-3">
              <Activity className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-black">{currentTest.name}</h2>
                {currentTest.isObservation && (
                  <Badge variant="outline" className="text-xs">Observation</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-2">
                <Badge className="bg-muted text-muted-foreground text-xs">
                  {assessmentData.region || contextRegion} Region
                </Badge>
                {currentTest.associatedConditions?.map((condition, index) => (
                  <Badge key={index} className="bg-warning/10 text-warning-foreground text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
              <p className="text-muted-foreground mt-2">{currentTest.instruction}</p>
            </div>
          </div>

          {/* Implications */}
          <div className="mb-6 grid grid-cols-2 gap-4">
            <div className="bg-success/10 rounded-xl p-4">
              <p className="text-success text-xs font-bold uppercase">If Positive</p>
              <p className="mt-1 text-sm">{currentTest.positiveImplication}</p>
            </div>
            <div className="bg-destructive/10 rounded-xl p-4">
              <p className="text-destructive text-xs font-bold uppercase">If Negative</p>
              <p className="mt-1 text-sm">{currentTest.negativeImplication}</p>
            </div>
          </div>

          {/* Notes Input */}
          <div className="mb-6">
            <label className="text-muted-foreground text-xs font-bold uppercase">
              Notes (Optional)
            </label>
            <textarea
              className="border-border mt-1 w-full rounded-xl border p-3 text-sm"
              placeholder="Add any observations or notes..."
              value={testNotes}
              onChange={(e) => setTestNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-4">
            <Button
              size="lg"
              className="bg-success hover:bg-success/90 h-16 text-white"
              onClick={() => recordResult('positive')}
              disabled={isRecording}
            >
              {isRecording ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-5 w-5" />
                  Positive
                </>
              )}
            </Button>
            <Button
              size="lg"
              className="bg-destructive hover:bg-destructive/90 h-16 text-white"
              onClick={() => recordResult('negative')}
              disabled={isRecording}
            >
              {isRecording ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <XCircle className="mr-2 h-5 w-5" />
                  Negative
                </>
              )}
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-16"
              onClick={() => recordResult('skipped')}
              disabled={isRecording}
            >
              <SkipForward className="mr-2 h-5 w-5" />
              Skip
            </Button>
          </div>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <AlertTriangle className="text-warning mx-auto mb-4 h-12 w-12" />
          <h3 className="font-bold">No Tests Available</h3>
          <p className="text-muted-foreground mt-2 text-sm">
            No recommended tests were found for this assessment.
          </p>
          <Button className="mt-4" onClick={() => router.push(`/clinician/cases/${id}`)}>
            Return to Case File
          </Button>
        </Card>
      )}

      {/* Completed Tests Summary */}
      {completedTests.length > 0 && (
        <Card className="p-4">
          <h4 className="mb-3 font-bold">Completed Tests</h4>
          <div className="space-y-2">
            {completedTests.map((test, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between rounded-lg border p-2 text-sm',
                  test.result === 'positive'
                    ? 'border-success/30 bg-success/5'
                    : test.result === 'negative'
                      ? 'border-destructive/30 bg-destructive/5'
                      : 'border-border bg-muted/50'
                )}
              >
                <span>{test.testName}</span>
                <Badge
                  className={cn(
                    'text-xs',
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
        </Card>
      )}
    </div>
  );
}
