import connectDB from '@/lib/db/connect';
import { User, DiagnosisSession, TreatmentPlan } from '@/models';
import { auth } from '@/auth';
import { redirect, notFound } from 'next/navigation';
import {
  ArrowLeft,
  User as UserIcon,
  Activity,
  Clock,
  CheckCircle2,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';
import { Badge, Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/cn';

function SectionCard({ title, children, icon: Icon }) {
  return (
    <Card className="rounded-2xl border-none bg-white shadow-sm dark:bg-slate-900/40">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          {Icon && <Icon className="text-primary h-5 w-5" />}
          <h3 className="text-sm font-black tracking-widest text-slate-400 uppercase">
            {title}
          </h3>
        </div>
        <div className="space-y-4">{children}</div>
      </CardContent>
    </Card>
  );
}

function BulletList({ items }) {
  if (!items || items.length === 0)
    return <p className="text-muted-foreground text-xs italic">No items recorded</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm font-bold">
          <div className="bg-primary/20 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function TreatmentPlanViewPage({ params }) {
  const { id } = params;
  const sessionUser = await auth();
  if (!sessionUser) redirect('/login');

  await connectDB();

  // Fetch patient, latest session, and treatment plan
  const [patient, session, plan] = await Promise.all([
    User.findById(id).lean(),
    DiagnosisSession.findOne({ patientId: id }).sort({ createdAt: -1 }).lean(),
    TreatmentPlan.findOne({ patient: id, status: 'active' })
      .sort({ updatedAt: -1 })
      .lean(),
  ]);

  if (!patient) notFound();

  const aiRes = session?.aiAnalysis || {};

  const calculateAge = (dob) => {
    if (!dob) return 'N/A';
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="animate-fade-in mx-auto w-full max-w-5xl space-y-8 px-4 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/clinician/treatment"
            className="hover:bg-muted bg-card border-border rounded-xl border p-2 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-black tracking-tight tracking-widest uppercase">
              Recovery Roadmap
            </h1>
            <p className="text-muted-foreground text-xs font-bold uppercase">
              Clinical Treatment Plan & AI Diagnostics
            </p>
          </div>
        </div>

        {plan && (
          <div className="flex items-center gap-4 rounded-3xl bg-white p-2 pr-6 shadow-sm dark:bg-slate-900/40">
            <div className="bg-primary shadow-primary/30 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                Recovery Progress
              </p>
              <div className="flex items-center gap-3">
                <div className="bg-muted h-2 w-32 overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full rounded-full transition-all duration-1000"
                    style={{ width: `${plan.progress}%` }}
                  />
                </div>
                <span className="text-sm font-black">{plan.progress}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Patient Profile Quick View */}
      <Card className="rounded-[2.5rem] border-none bg-linear-to-br from-slate-900 to-slate-800 text-white shadow-2xl">
        <CardContent className="flex flex-col items-center gap-8 p-8 md:flex-row">
          <div className="relative">
            <div className="h-24 w-24 overflow-hidden rounded-[2rem] border-4 border-white/10 bg-white/5 shadow-2xl">
              {patient.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.firstName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-black opacity-30">
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </div>
              )}
            </div>
            <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-2xl border-4 border-slate-900 bg-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-black tracking-tight uppercase">
                {patient.firstName} {patient.lastName}
              </h2>
              <div className="mt-1 flex flex-wrap justify-center gap-4 text-xs font-bold tracking-widest uppercase opacity-60 md:justify-start">
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="outline"
                    className="border-white/20 text-white uppercase"
                  >
                    {patient.gender || 'Not Specified'}
                  </Badge>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>Age: {calculateAge(patient.dateOfBirth)} Yrs</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span>ID: #P-{patient._id.toString().slice(-6)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Link href={`/clinician/messages?patientId=${patient._id}`}>
              <Button className="h-14 w-14 rounded-2xl border-none bg-white/10 text-white hover:bg-white/20">
                <FileText className="h-6 w-6" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Diagnostics */}
        <div className="space-y-8 lg:col-span-1">
          <SectionCard title="AI Diagnostics" icon={Activity}>
            <div className="space-y-6">
              <div>
                <p className="mb-2 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Primary Impression
                </p>
                <p className="text-lg leading-tight font-black text-cyan-500">
                  {aiRes.temporalDiagnosis || 'Awaiting Assessment'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    Risk Level
                  </p>
                  <Badge
                    className={cn(
                      'text-[10px] font-black tracking-widest uppercase',
                      aiRes.riskLevel === 'Urgent'
                        ? 'bg-red-500'
                        : aiRes.riskLevel === 'Moderate'
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                    )}
                  >
                    {aiRes.riskLevel || 'Low'}
                  </Badge>
                </div>
                <div className="rounded-2xl border bg-slate-50 p-4 dark:bg-slate-800/50">
                  <p className="mb-1 text-[9px] font-black tracking-widest text-slate-400 uppercase">
                    AI Confidence
                  </p>
                  <p className="text-xl font-black">{aiRes.confidenceScore || 0}%</p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-[10px] font-black tracking-widest text-slate-400 uppercase">
                  Clinical Reasoning
                </p>
                <BulletList items={aiRes.reasoning} />
              </div>
            </div>
          </SectionCard>

          <div className="rounded-[2rem] bg-indigo-600 p-8 text-white shadow-xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
              <Clock className="h-6 w-6" />
            </div>
            <h4 className="text-lg leading-tight font-black uppercase">Last Activity</h4>
            <p className="mt-2 text-xs leading-relaxed font-medium opacity-80">
              {plan?.updatedAt
                ? new Date(plan.updatedAt).toLocaleDateString(undefined, {
                    dateStyle: 'long',
                  })
                : 'No recent activity recorded.'}
            </p>
          </div>
        </div>

        {/* Middle/Right Column: Treatment Plan */}
        <div className="space-y-8 lg:col-span-2">
          <SectionCard title="Therapeutic Strategy" icon={CheckCircle2}>
            {plan && plan.activities && plan.activities.length > 0 ? (
              <div className="space-y-8">
                {plan.activities
                  .slice()
                  .reverse()
                  .map((act, i) => (
                    <div
                      key={i}
                      className={cn(
                        'relative flex flex-col gap-6 rounded-3xl border p-6 transition-all hover:bg-slate-50 dark:hover:bg-white/5',
                        i === 0
                          ? 'border-primary/30 ring-primary/5 ring-4'
                          : 'border-slate-100'
                      )}
                    >
                      {i === 0 && (
                        <Badge className="bg-primary absolute -top-3 left-6 px-3 py-1 font-black uppercase">
                          Latest Milestone
                        </Badge>
                      )}

                      <div className="flex items-center justify-between">
                        <h4 className="flex items-center gap-2 text-lg font-black uppercase">
                          <span className="text-primary text-2xl opacity-30">#</span>{' '}
                          {act.goal}
                        </h4>
                        <span className="text-muted-foreground text-[10px] font-black uppercase">
                          {new Date(act.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            In-Clinic Treatment
                          </p>
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-100/50 p-4 dark:bg-slate-800">
                            <Activity className="mt-0.5 h-4 w-4 shrink-0 text-indigo-500" />
                            <p className="text-sm font-bold">{act.activeTreatment}</p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Home Exercise Regimen
                          </p>
                          <div className="flex items-start gap-3 rounded-2xl bg-slate-100/50 p-4 dark:bg-slate-800">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                            <p className="text-sm font-bold">{act.homeExercise}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2.5rem] border-4 border-dashed border-slate-100 text-center opacity-40">
                <FileText className="mb-4 h-16 w-16" />
                <p className="text-xl font-black uppercase">No Active Plan</p>
                <p className="max-w-xs text-sm font-medium">
                  This patient does not have a confirmed treatment program yet.
                </p>
              </div>
            )}
          </SectionCard>

          <div className="bg-muted/30 flex items-start gap-4 rounded-3xl border border-dashed border-slate-200 p-6">
            <div className="bg-primary/10 text-primary mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem]">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h5 className="text-sm font-black uppercase">Clinician Note</h5>
              <p className="text-muted-foreground mt-1 text-xs leading-relaxed font-medium">
                This plan is dynamic and should be adjusted based on the patient's
                biomechanical response and symptom progression. Regular re-evaluation is
                mandatory every 3-5 sessions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
