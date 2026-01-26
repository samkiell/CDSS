import { auth } from '@/auth';
import dbConnect from '@/lib/db/connect';
import { DiagnosisSession, TreatmentPlan } from '@/models';
import { redirect } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Badge,
} from '@/components/ui';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Calendar,
  Target,
  Award,
  ClipboardCheck,
  AlertCircle,
} from 'lucide-react';
import ProgressCharts from './ProgressCharts';

export default async function ProgressPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect('/login');
  }

  await dbConnect();

  const [sessionsData, treatmentPlanData] = await Promise.all([
    DiagnosisSession.find({ patientId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean(),
    TreatmentPlan.findOne({ patient: session.user.id, status: 'active' }).lean(),
  ]);

  // Serialize to plain objects
  const sessions = JSON.parse(JSON.stringify(sessionsData));
  const treatmentPlan = JSON.parse(JSON.stringify(treatmentPlanData));

  // Process data for charts
  const painHistory = sessions
    .filter((sess) => sess.symptomData?.some((s) => s.questionCategory === 'pain_intensity'))
    .map((sess) => {
      const intensityScore = sess.symptomData?.find(
        (s) => s.questionCategory === 'pain_intensity'
      )?.response;
      return {
        date: new Date(sess.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        intensity: typeof intensityScore === 'number' ? intensityScore : 0,
        fullDate: sess.createdAt,
      };
    })
    .reverse();

  // Risk level distribution
  const riskDistribution = sessions.reduce(
    (acc, sess) => {
      const risk = sess.aiAnalysis?.riskLevel || 'Unknown';
      acc[risk] = (acc[risk] || 0) + 1;
      return acc;
    },
    { Low: 0, Moderate: 0, Urgent: 0 }
  );

  // Body region distribution
  const bodyRegionData = sessions.reduce((acc, sess) => {
    const region = sess.bodyRegion || 'Unknown';
    acc[region] = (acc[region] || 0) + 1;
    return acc;
  }, {});

  const bodyRegionChartData = Object.entries(bodyRegionData).map(([name, value]) => ({
    name,
    value,
  }));

  // Calculate stats
  const totalAssessments = sessions.length;
  const completedAssessments = sessions.filter((s) => s.status === 'completed').length;
  const avgConfidence =
    sessions.length > 0
      ? Math.round(
          sessions.reduce((sum, s) => sum + (s.aiAnalysis?.confidenceScore || 0), 0) /
            sessions.length
        )
      : 0;

  // Pain trend calculation
  const recentPain = painHistory.slice(-7);
  const olderPain = painHistory.slice(-14, -7);
  const recentAvg =
    recentPain.length > 0
      ? recentPain.reduce((sum, p) => sum + p.intensity, 0) / recentPain.length
      : 0;
  const olderAvg =
    olderPain.length > 0
      ? olderPain.reduce((sum, p) => sum + p.intensity, 0) / olderPain.length
      : 0;
  const painTrend = olderAvg > 0 ? ((olderAvg - recentAvg) / olderAvg) * 100 : 0;

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Progress Tracking</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Monitor your recovery journey and health trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-blue-500/10 p-3">
              <ClipboardCheck className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Total Assessments
              </p>
              <h3 className="text-2xl font-bold">{totalAssessments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-green-500/10 p-3">
              <Award className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Completed
              </p>
              <h3 className="text-2xl font-bold">{completedAssessments}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="rounded-xl bg-purple-500/10 p-3">
              <Target className="h-6 w-6 text-purple-500" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Avg Confidence
              </p>
              <h3 className="text-2xl font-bold">{avgConfidence}%</h3>
            </div>
          </CardContent>
        </Card>

        <Card
          className={`border-l-4 ${painTrend >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}
        >
          <CardContent className="flex items-center gap-4 p-6">
            <div
              className={`rounded-xl p-3 ${painTrend >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}
            >
              {painTrend >= 0 ? (
                <TrendingDown className="h-6 w-6 text-green-500" />
              ) : (
                <TrendingUp className="h-6 w-6 text-red-500" />
              )}
            </div>
            <div>
              <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                Pain Trend
              </p>
              <h3 className="text-2xl font-bold">
                {painTrend >= 0 ? '-' : '+'}
                {Math.abs(Math.round(painTrend))}%
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plan Progress */}
      {treatmentPlan && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Treatment Plan</CardTitle>
                <CardDescription>{treatmentPlan.conditionName}</CardDescription>
              </div>
              <Badge variant="default">{treatmentPlan.status}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Overall Progress</span>
                <span className="font-semibold">{treatmentPlan.progress || 0}%</span>
              </div>
              <div className="bg-muted h-3 overflow-hidden rounded-full">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${treatmentPlan.progress || 0}%` }}
                />
              </div>
              <p className="text-muted-foreground text-sm">
                Managed by: <span className="text-foreground">{treatmentPlan.therapistName}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts */}
      <ProgressCharts
        painHistory={painHistory}
        riskDistribution={riskDistribution}
        bodyRegionData={bodyRegionChartData}
      />

      {/* Recent Assessments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
          <CardDescription>Your latest health assessments and diagnoses</CardDescription>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="text-muted-foreground mb-4 h-12 w-12" />
              <p className="text-muted-foreground">No assessments yet</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Start your first assessment to track your progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.slice(0, 5).map((sess) => (
                <div
                  key={sess._id}
                  className="border-border flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <Activity className="text-primary h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{sess.bodyRegion}</h4>
                      <p className="text-muted-foreground text-sm">
                        {new Date(sess.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        sess.aiAnalysis?.riskLevel === 'Low'
                          ? 'bg-green-500/10 text-green-600'
                          : sess.aiAnalysis?.riskLevel === 'Moderate'
                            ? 'bg-yellow-500/10 text-yellow-600'
                            : 'bg-red-500/10 text-red-600'
                      }
                    >
                      {sess.aiAnalysis?.riskLevel || 'Pending'}
                    </Badge>
                    <span className="text-muted-foreground text-sm">
                      {sess.aiAnalysis?.confidenceScore || 0}% confidence
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
