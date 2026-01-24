import { Card, CardContent } from '@/components/ui';
import { Construction } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Construction className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold text-foreground">
            Reports
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is not implemented yet.
            <br />
            Waiting for assigned developer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
