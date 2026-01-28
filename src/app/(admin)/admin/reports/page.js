import connectDB from '@/lib/db/connect';
import DiagnosisSession from '@/models/DiagnosisSession';
import AdminReportsClient from '@/components/admin/ReportsClient';

export default async function AdminReportsPage() {
  await connectDB();

  // Aggregate clinical stats
  const [totalSessions, riskAggregation, regionalAggregation] = await Promise.all([
    DiagnosisSession.countDocuments(),
    DiagnosisSession.aggregate([
      { $group: { _id: '$aiAnalysis.riskLevel', count: { $sum: 1 } } },
    ]),
    DiagnosisSession.aggregate([
      { $group: { _id: '$bodyRegion', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
  ]);

  // Average confidence score
  const avgConfidenceResult = await DiagnosisSession.aggregate([
    { $group: { _id: null, avgScore: { $avg: '$aiAnalysis.confidenceScore' } } },
  ]);

  // Map risk data
  const riskData = {
    Low: riskAggregation.find((r) => r._id === 'Low')?.count || 0,
    Moderate: riskAggregation.find((r) => r._id === 'Moderate')?.count || 0,
    Urgent: riskAggregation.find((r) => r._id === 'Urgent')?.count || 0,
  };

  // Map regional data
  const regionalData = regionalAggregation.map((r) => ({
    region: r._id || 'Unknown',
    count: r.count,
  }));

  const stats = {
    totalSessions,
    avgConfidence: Math.round(avgConfidenceResult[0]?.avgScore || 0),
    avgReviewTime: 1.2, // Placeholder for temporal calculation
    riskData,
    regionalData: regionalData.slice(0, 5),
  };

  return (
    <div className="space-y-8 px-2 pb-12">
      <header className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 uppercase dark:text-white">
          System Reports & Analytics
        </h2>
        <p className="max-w-2xl font-medium text-gray-500">
          Granular insights into platform usage, diagnostic trends, and clinical
          performance metrics.
        </p>
      </header>

      <AdminReportsClient stats={stats} />
    </div>
  );
}
