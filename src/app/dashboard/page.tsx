
"use client";

import { QuickActions } from '@/components/dashboard/quick-actions';
import { CurrentTrips } from '@/components/dashboard/current-trips';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SOSCenter } from '@/components/dashboard/sos-center';
import { Button } from '@/components/ui/button';
import { FileText, UtensilsCrossed, ShieldAlert, Newspaper, BriefcaseMedical } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content Column */}
      <div className="lg:col-span-2 space-y-6">
        <QuickActions />
        <CurrentTrips />
        <SOSCenter />
      </div>

      {/* Side Column for Actions */}
      <div className="lg:col-span-1 flex flex-col">
        <Card className="flex-grow flex flex-col p-6 border">
          <CardHeader className="p-0 pb-4">
            <CardTitle className="font-headline text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-stretch justify-start p-0 gap-3">
             <Button asChild variant="outline" className="w-full justify-start text-base py-6">
                <Link href="/dashboard/news-and-safety">
                    <Newspaper className="mr-3" />
                    News & Safety
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start text-base py-6">
                <Link href="/dashboard/medical-aid">
                    <BriefcaseMedical className="mr-3" />
                    Medical Aid
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start text-base py-6">
                <Link href="/dashboard/cuisine">
                  <UtensilsCrossed className="mr-3" />
                  Cuisine Recommendations
                </Link>
             </Button>
             <Button asChild variant="outline" className="w-full justify-start text-base py-6">
                <Link href="/dashboard/report-theft">
                    <ShieldAlert className="mr-3" />
                    Report Petty Thefts
                </Link>
             </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
