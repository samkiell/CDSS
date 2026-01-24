import { Card, CardContent } from '@/components/ui';
import { Construction } from 'lucide-react';

export default function ReferralPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Construction className="text-muted-foreground mb-4 h-12 w-12" />
          <h2 className="text-foreground text-lg font-semibold">Referral or Order</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            This page is not implemented yet.
            <br />
            Waiting for assigned developer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
