"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckCircle, AlertTriangle, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EFirIncidentPage({ params }: { params: { incidentId: string } }) {
  const { t } = useLanguage();
  const { incidentId } = params;

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-8 w-8 text-green-500" />
        <div>
          <h1 className="text-3xl font-bold font-headline">
             Provisional E-FIR Logged
          </h1>
          <p className="text-muted-foreground text-sm">
            Incident ID: <span className="font-mono text-primary">{incidentId}</span>
          </p>
        </div>
      </div>

      <Card className="border-green-500/20 shadow-md">
        <CardHeader className="bg-green-500/10 pb-4">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <ShieldAlert className="h-5 w-5" />
            Alerts Sent Successfully
          </CardTitle>
          <CardDescription className="text-green-800/80">
            Your emergency contacts and nearby users have been notified of your situation.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
             <div className="p-4 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-800">What happens next?</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    A provisional E-FIR has been auto-filed with the nearest authorities using your location and audio evidence. You can view the formal report once it is processed by the police department.
                  </p>
                </div>
             </div>
             
             <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild className="w-full sm:w-auto">
                   <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                   <Link href="/e-fir">View All Reports</Link>
                </Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
