import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import { User, DiagnosisSession, Appointment, TreatmentPlan } from '@/models';
import { redirect } from 'next/navigation';
import {
  Calendar,
  User as UserIcon,
  Activity,
  ChevronRight,
  Play,
  FileText,
  PlusCircle,
  Search,
  Video,
  Clipboard,
  Upload,
  Clock,
} from 'lucide-react';
import PainChart from '@/components/dashboard/PainChart';
import Link from 'next/link';
import Image from 'next/image';

export default async function PatientDashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  await dbConnect();

  const [patient, latestSession, appointments, treatmentPlan, pastSessions] =
    await Promise.all([
      User.findById(session.user.id).select('firstName lastName avatar'),
      DiagnosisSession.findOne({ patientId: session.user.id }).sort({ createdAt: -1 }),
      Appointment.find({ patient: session.user.id, date: { $gte: new Date() } }).sort({
        date: 1,
      }),
      TreatmentPlan.findOne({ patient: session.user.id, status: 'active' }),
      DiagnosisSession.find({ patientId: session.user.id })
        .sort({ createdAt: -1 })
        .limit(7),
    ]);

  // Aggregate pain history for the chart
  const painHistory = pastSessions
    .map((sess) => ({
      date: new Date(sess.createdAt).toLocaleDateString('en-US', { weekday: 'short' }),
      intensity:
        sess.symptoms?.find((s) => s.questionCategory === 'pain_intensity')?.response ||
        0,
    }))
    .reverse();

  const nextAppointment = appointments[0];

  return (
    <div className="mx-auto min-h-screen max-w-7xl bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Welcome Back, {patient?.firstName || session.user.firstName}!
          </h1>
          <p className="mt-1 text-slate-500">
            Here's your health summary and upcoming schedule.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-slate-100 bg-white p-2 pr-4 shadow-sm">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-blue-600 bg-blue-100">
            {patient?.avatar ? (
              <Image src={patient.avatar} alt="Profile" fill className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xl font-bold text-blue-600">
                {patient?.firstName?.[0] || 'U'}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {patient?.firstName} {patient?.lastName}
            </p>
            <p className="text-xs text-slate-500">
              Patient ID: {session.user.id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-blue-50 p-3">
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
              Next Appointment
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {nextAppointment
                ? new Date(nextAppointment.date).toLocaleDateString()
                : 'No upcoming'}
            </p>
            {nextAppointment && (
              <p className="text-sm text-slate-500">
                {new Date(nextAppointment.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-indigo-50 p-3">
            <UserIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
              Assigned Physiotherapist
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {treatmentPlan?.therapistName || 'Not Assigned'}
            </p>
            <p className="text-sm text-slate-500">
              {treatmentPlan ? 'Active Care' : 'Pending Intake'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="rounded-xl bg-emerald-50 p-3">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-xs font-medium tracking-wider text-slate-500 uppercase">
              Current Case
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 capitalize">
              {latestSession?.temporalDiagnosis?.primaryDiagnosis?.conditionName ||
                'No active case'}
            </p>
            <p className="text-sm text-slate-500">
              Status: {latestSession?.sessionStatus?.replace('_', ' ') || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Assessment Widget (Hero) - Left Col 8 */}
        <div className="space-y-6 md:col-span-8">
          <div className="relative overflow-hidden rounded-2xl bg-blue-600 p-8 text-white shadow-lg shadow-blue-200">
            <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
              <div className="max-w-md">
                <div className="mb-4 flex items-center gap-2">
                  <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-bold text-blue-900 uppercase">
                    {latestSession?.sessionStatus === 'in_progress'
                      ? 'In Progress'
                      : 'Current Plan'}
                  </span>
                  <span className="text-sm text-blue-100">
                    Started{' '}
                    {latestSession
                      ? new Date(latestSession.createdAt).toLocaleDateString()
                      : 'N/A'}
                  </span>
                </div>
                <h2 className="mb-2 text-2xl font-bold">
                  {latestSession?.temporalDiagnosis?.primaryDiagnosis?.conditionName ||
                    'Start Your Assessment'}
                </h2>
                <p className="mb-6 text-blue-100">
                  {latestSession?.sessionStatus === 'in_progress'
                    ? 'You have an ongoing assessment. Complete it to get a personalized treatment plan from our AI.'
                    : 'Track your recovery, perform self-tests, and stay connected with your clinician.'}
                </p>
                <div className="mb-6 h-3 w-full rounded-full bg-blue-700/50">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-500"
                    style={{
                      width: `${latestSession?.sessionStatus === 'in_progress' ? 65 : 100}%`,
                    }}
                  ></div>
                </div>
                <Link
                  href="/assessment"
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-blue-600 shadow-sm transition-colors hover:bg-blue-50"
                >
                  {latestSession?.sessionStatus === 'in_progress'
                    ? 'Continue Assessment'
                    : 'New Assessment'}
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>
              <div className="hidden md:block">
                <div className="rounded-full border-4 border-blue-400/20 bg-blue-500/30 p-8">
                  <Activity className="h-24 w-24 text-white/50" />
                </div>
              </div>
            </div>
            {/* Background elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 h-64 w-64 rounded-full bg-white/5"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 h-32 w-32 rounded-full bg-white/5"></div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Recovery Progress</h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <span>Pain Intensity Score</span>
              </div>
            </div>
            <PainChart history={painHistory} />
          </div>

          {/* Treatment Plan Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">Weekly Treatment Plan</h3>
              <button className="text-sm font-semibold text-blue-600 hover:underline">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-slate-100 bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Goal
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Active Treatment
                    </th>
                    <th className="px-6 py-4 text-xs font-bold tracking-wider text-slate-500 uppercase">
                      Home Exercise
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {treatmentPlan?.activities?.length > 0 ? (
                    treatmentPlan.activities.map((activity, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-slate-700">
                          {new Date(activity.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {activity.goal}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {activity.activeTreatment}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 font-medium text-blue-700">
                            <Play className="h-3 w-3 fill-current" />
                            {activity.homeExercise}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="4"
                        className="px-6 py-12 text-center text-slate-400 italic"
                      >
                        No activities scheduled for this week.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar - Right Col 4 */}
        <div className="space-y-6 md:col-span-4">
          {/* Quick Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/assessment/new"
              className="group rounded-2xl border border-orange-100 bg-orange-50 p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-white transition-transform group-hover:scale-110">
                <PlusCircle className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Start New Assessment</p>
            </Link>
            <Link
              href="/assessment"
              className="group rounded-2xl border border-yellow-100 bg-yellow-50 p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-500 text-white transition-transform group-hover:scale-110">
                <Clock className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Continue Case</p>
            </Link>
            <Link
              href="/appointments"
              className="group rounded-2xl border border-emerald-100 bg-emerald-50 p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white transition-transform group-hover:scale-110">
                <Calendar className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Book Appt</p>
            </Link>
            <Link
              href="/self-test"
              className="group rounded-2xl border border-blue-100 bg-blue-50 p-4 transition-all hover:shadow-md"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white transition-transform group-hover:scale-110">
                <Video className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900">Do Self-Test</p>
            </Link>
            <Link
              href="/documents"
              className="group col-span-2 flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-2 transition-all hover:border-blue-300"
            >
              <div className="flex items-center gap-2 py-2">
                <Upload className="h-5 w-5 text-slate-400 group-hover:text-blue-500" />
                <span className="font-semibold text-slate-500 group-hover:text-slate-900">
                  Upload Documents
                </span>
              </div>
            </Link>
          </div>

          {/* Appointments List */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">
              Upcoming Appointments
            </h3>
            <div className="space-y-4">
              {appointments.length > 0 ? (
                appointments.map((appt, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <p className="font-bold text-slate-900">{appt.type}</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <UserIcon className="h-3 w-3" /> Dr. {appt.therapistName}
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        {appt.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="h-4 w-4" />
                        {new Date(appt.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-4 w-4" />
                        {new Date(appt.date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button className="flex-1 rounded-lg bg-blue-600 py-2 text-xs font-bold text-white transition-colors hover:bg-blue-700">
                        Join Session
                      </button>
                      <button className="flex-1 rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50">
                        Reschedule
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-slate-400">
                  No upcoming appointments.
                </div>
              )}
            </div>
          </div>

          {/* Guided Self-Tests */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Guided Self-Tests</h3>
              <button className="text-sm font-semibold text-blue-600 hover:underline">
                Browse
              </button>
            </div>
            <div className="space-y-4">
              {[
                {
                  title: 'Lumbar Rotation Test',
                  duration: '5 mins',
                  thumb: 'bg-blue-100',
                },
                {
                  title: 'Neck Flexibility Scan',
                  duration: '3 mins',
                  thumb: 'bg-indigo-100',
                },
              ].map((test, idx) => (
                <div key={idx} className="group flex cursor-pointer gap-4">
                  <div
                    className={`h-16 w-24 rounded-lg ${test.thumb} flex shrink-0 items-center justify-center transition-transform group-hover:scale-105`}
                  >
                    <Video className="h-6 w-6 text-blue-600/40" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 transition-colors group-hover:text-blue-600">
                      {test.title}
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      {test.duration} tutorial
                    </p>
                    <button className="mt-2 flex items-center gap-1 text-xs font-bold text-blue-600">
                      Watch Tutorial <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tests */}
          <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Clinical Tests</h3>
            <div className="space-y-3">
              {[
                {
                  type: 'X-Ray: Lumbar Spine',
                  status: 'Scheduled',
                  color: 'bg-purple-100 text-purple-700',
                },
                {
                  type: 'Blood Test: CRP',
                  status: 'Confirmed',
                  color: 'bg-emerald-100 text-emerald-700',
                },
                {
                  type: 'MRI: Request Sent',
                  status: 'Pending',
                  color: 'bg-yellow-100 text-yellow-700',
                },
              ].map((test, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-xl p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <Clipboard className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {test.type}
                    </span>
                  </div>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${test.color}`}
                  >
                    {test.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
