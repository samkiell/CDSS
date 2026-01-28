import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import { User, DiagnosisSession, Appointment, TreatmentPlan, CaseFile } from '@/models';
import { redirect } from 'next/navigation';
import {
  Calendar,
  User as UserIcon,
  Activity,
  ChevronRight,
  Play,
  PlusCircle,
  Video,
  Clipboard,
  Upload,
  Clock,
  AlertCircle,
} from 'lucide-react';
import PainChart from '@/components/dashboard/PainChart';
import AssessmentHero from '@/components/dashboard/AssessmentHero';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
  Button,
} from '@/components/ui';
import Link from 'next/link';

export default async function PatientDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  await dbConnect();

  const [
    patientData,
    latestSessionData,
    appointmentsData,
    treatmentPlanData,
    pastSessionsData,
    caseFilesData,
  ] = await Promise.all([
    User.findById(session.user.id).select('firstName lastName avatar').lean(),
    DiagnosisSession.findOne({ patientId: session.user.id })
      .populate('clinicianId', 'firstName lastName')
      .sort({ createdAt: -1 })
      .lean(),
    Appointment.find({ patient: session.user.id, date: { $gte: new Date() } })
      .sort({
        date: 1,
      })
      .lean(),
    TreatmentPlan.findOne({ patient: session.user.id, status: 'active' }).lean(),
    DiagnosisSession.find({ patientId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(7)
      .lean(),
    CaseFile.find({ patientId: session.user.id }).sort({ createdAt: -1 }).limit(5).lean(),
  ]);

  // Serialize to plain objects for Client Components
  const patient = JSON.parse(JSON.stringify(patientData));
  const latestSession = JSON.parse(JSON.stringify(latestSessionData));
  const appointments = JSON.parse(JSON.stringify(appointmentsData));
  const pastSessions = JSON.parse(JSON.stringify(pastSessionsData));
  const caseFiles = JSON.parse(JSON.stringify(caseFilesData));
  let treatmentPlan = JSON.parse(JSON.stringify(treatmentPlanData));

  // 🏥 FALLBACK: If no active clinician treatment plan, synthesize a provisional one from latest AI analysis
  if (!treatmentPlan && latestSession) {
    const assignedTherapist = latestSession.clinicianId
      ? `Dr. ${latestSession.clinicianId.lastName || latestSession.clinicianId.firstName}`
      : 'None assigned';

    treatmentPlan = {
      isProvisional: true,
      therapistName: assignedTherapist,
      conditionName: latestSession.aiAnalysis.temporalDiagnosis,
      activities: [
        {
          date: latestSession.createdAt,
          goal: 'Initial Symptom Management',
          activeTreatment: 'Reviewing Assessment Findings',
          homeExercise: `Gentle ${latestSession.bodyRegion} Mobility`,
        },
      ],
    };
  }

  // Aggregate pain history for the chart
  const painHistory = pastSessions
    .map((sess) => {
      // 1. Try to find explicit pain_intensity category
      let painEntry = sess.symptomData?.find(
        (s) => s.questionCategory === 'pain_intensity'
      );

      // 2. Try to find "intensity" or "scale" in question text (fallback)
      if (!painEntry) {
        painEntry = sess.symptomData?.find(
          (s) =>
            s.question?.toLowerCase().includes('intensity') ||
            s.question?.toLowerCase().includes('scale')
        );
      }

      let intensity = 0;
      const response = painEntry?.response || painEntry?.answer;

      if (typeof response === 'number') {
        intensity = response;
      } else if (typeof response === 'string') {
        const match = response.match(/\d+/);
        intensity = match ? parseInt(match[0], 10) : 0;
      }

      // 3. SECONDARY FALLBACK: Infer intensity from urgency/red flags if still 0
      // This makes the graph "active" for older assessments that were serious but didn't have a 0-10 score
      if (intensity === 0) {
        const hasRedFlags = sess.symptomData?.some((s) => {
          const ans = String(s.answer || s.response || '').toLowerCase();
          return (
            (ans === 'yes' && s.question?.toLowerCase().includes('bladder')) ||
            (ans === 'yes' && s.question?.toLowerCase().includes('numbness')) ||
            (ans === 'yes' && s.question?.toLowerCase().includes('weakness'))
          );
        });

        if (hasRedFlags) intensity = 8;
        else if (sess.aiAnalysis?.riskLevel === 'Urgent') intensity = 9;
        else if (sess.aiAnalysis?.riskLevel === 'Moderate') intensity = 5;
        else if (sess.symptomData?.length > 0) intensity = 3; // Minimum visible activity
      }

      return {
        date: new Date(sess.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        intensity,
        fullDate: sess.createdAt,
      };
    })
    .reverse();

  const nextAppointment = appointments[0];

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground text-sm font-medium">
            Keep track of your symptoms and recovery progress here.
          </p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-l-primary border-l-4">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="bg-primary/10 rounded-xl p-3">
              <Calendar className="text-primary h-6 w-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Next Appointment
              </p>
              <h3 className="text-lg font-bold">
                {nextAppointment
                  ? new Date(nextAppointment.date).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'No upcoming'}
              </h3>
              {nextAppointment && (
                <p className="text-muted-foreground text-xs">
                  {new Date(nextAppointment.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-indigo-500/10 p-3">
              <UserIcon className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Assigned Therapist
              </p>
              <h3 className="max-w-37.5 truncate text-lg font-bold">
                {treatmentPlan?.therapistName ||
                  nextAppointment?.therapistName ||
                  'None assigned'}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-emerald-500/10 p-3">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                Active Case
              </p>
              <h3 className="max-w-37.5 truncate text-lg font-bold">
                {latestSession?.temporalDiagnosis?.primaryDiagnosis?.conditionName ||
                  'No active case'}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Section: Main Highlights */}
        <div className="space-y-6 md:col-span-8">
          <AssessmentHero latestSession={latestSession} />

          {/* Recovery Progress Chart */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="text-xl">Pain Progress</CardTitle>
                <CardDescription>
                  Visualizing your pain levels over the last few assessments
                </CardDescription>
              </div>
              <Activity className="text-muted-foreground h-5 w-5" />
            </CardHeader>
            <CardContent>
              <PainChart history={painHistory} />
            </CardContent>
          </Card>

          {/* Treatment Plan Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <div className="flex items-center gap-3">
                  <CardTitle className="text-xl">Current Treatment Activities</CardTitle>
                  {treatmentPlan?.isProvisional && (
                    <Badge
                      variant="outline"
                      className="animate-pulse border-blue-400 text-blue-500"
                    >
                      Provisional
                    </Badge>
                  )}
                </div>
                <CardDescription>
                  {treatmentPlan?.isProvisional
                    ? 'AI recommended care while you wait for clinician review'
                    : 'Scheduled exercises and clinical sessions'}
                </CardDescription>
              </div>
              <Link
                href="/patient/progress"
                className="text-primary text-xs font-bold hover:underline"
              >
                View Full Plan
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-muted/50 border-border border-y">
                    <tr>
                      <th className="text-muted-foreground px-6 py-3 text-[10px] font-bold tracking-widest uppercase">
                        Date
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-[10px] font-bold tracking-widest uppercase">
                        Goal
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-[10px] font-bold tracking-widest uppercase">
                        Treatment
                      </th>
                      <th className="text-muted-foreground px-6 py-3 text-[10px] font-bold tracking-widest uppercase">
                        Home Exercise
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {treatmentPlan?.activities?.length > 0 ? (
                      treatmentPlan.activities.map((activity, idx) => (
                        <tr key={idx} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4 text-sm font-bold whitespace-nowrap">
                            {new Date(activity.date).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </td>
                          <td className="text-muted-foreground px-6 py-4 text-sm font-medium">
                            {activity.goal}
                          </td>
                          <td className="text-muted-foreground px-6 py-4 text-sm font-medium">
                            {activity.activeTreatment}
                          </td>
                          <td className="px-6 py-4">
                            <Badge
                              variant="secondary"
                              className="flex w-fit items-center gap-1.5 font-bold"
                            >
                              <Play className="h-3 w-3 fill-current" />
                              {activity.homeExercise}
                            </Badge>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="4"
                          className="text-muted-foreground px-6 py-12 text-center text-sm italic"
                        >
                          No treatment activities found. Please complete an assessment or
                          wait for your therapist's assignment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Section: Actions & Details */}
        <div className="space-y-6 md:col-span-4">
          {/* Quick Action Grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                href: '/patient/assessment?new=true',
                label: 'New Assessment',
                icon: PlusCircle,
                bg: 'bg-orange-500',
              },
              {
                href: '/patient/assessment',
                label: 'Continue Case',
                icon: Clock,
                bg: 'bg-yellow-500',
              },
              {
                href: '/patient/progress',
                label: 'Clinical Files',
                icon: Clipboard,
                bg: 'bg-emerald-500',
              },
              {
                href: '/patient/self-test',
                label: 'Self Test',
                icon: Video,
                bg: 'bg-blue-500',
              },
            ].map((action, i) => (
              <Link key={i} href={action.href} className="group animate-scale-up">
                <Card className="hover:border-primary/50 h-full transition-all hover:shadow-md">
                  <CardContent className="flex flex-col items-center p-4 text-center">
                    <div
                      className={`${action.bg} mb-3 rounded-xl p-3 text-white transition-transform group-hover:scale-110`}
                    >
                      <action.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs leading-tight font-bold">
                      {action.label}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
            <Link href="/patient/documents" className="group col-span-2">
              <Card className="hover:border-primary hover:bg-primary/5 border-dashed transition-all">
                <CardContent className="flex items-center justify-center gap-2 p-4">
                  <Upload className="text-muted-foreground group-hover:text-primary h-4 w-4 group-hover:animate-bounce" />
                  <span className="text-muted-foreground group-hover:text-foreground text-xs font-bold">
                    Upload Medical Documents
                  </span>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Upcoming Appointment Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appt, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/30 border-border space-y-3 rounded-xl border p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm leading-none font-bold">{appt.type}</p>
                        <p className="text-muted-foreground mt-1.5 flex items-center gap-1.5 text-[11px] font-medium">
                          <UserIcon className="h-3 w-3" /> Dr. {appt.therapistName}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="bg-success/10 text-success border-success/20 text-[10px] font-black uppercase"
                      >
                        {appt.status}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground flex items-center justify-between pt-1 text-[11px] font-bold">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(appt.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3 w-3" />
                        {new Date(appt.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <Button size="sm" className="w-full text-xs font-bold">
                      JOIN SESSION
                    </Button>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center dark:border-slate-800 dark:bg-slate-900/20">
                  <AlertCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    No Appointments Scheduled
                  </p>
                  <p className="mx-auto mt-2 max-w-[180px] text-[10px] leading-relaxed font-medium text-slate-400">
                    Your assigned clinician will schedule your follow-up sessions and
                    treatments.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clinical Data Files</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseFiles.length > 0 ? (
                caseFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="border-border bg-muted/20 flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Clipboard className="text-muted-foreground h-4 w-4 shrink-0" />
                      <span className="truncate text-xs font-bold">{file.fileName}</span>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-primary/5 text-primary border-primary/20 shrink-0 text-[9px] font-black uppercase"
                    >
                      {file.category}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center text-[10px] italic">
                  No clinical reports or imaging files found.
                </p>
              )}
              <Link href="/patient/documents">
                <Button
                  variant="ghost"
                  className="bg-muted/30 mt-2 w-full text-[10px] font-bold tracking-widest uppercase"
                >
                  Manage Documents
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
