"use client";

import { useLanguage } from "@/hooks/use-language";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function EFirReportsPage() {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-headline mb-2">{t('e_fir_reports_title') || "E-FIR Reports"}</h1>
        <p className="text-muted-foreground">
          {t('e_fir_reports_desc') || "Review and manage electronically filed First Information Reports related to your SOS alerts."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent E-FIRs</CardTitle>
          <CardDescription>Your recently auto-filed or manually filed E-FIRs will appear here.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border rounded-md bg-muted/20 border-dashed">
            <FileText className="w-12 h-12 mb-4 text-muted-foreground/50" />
            <p>You have no pending E-FIRs to review.</p>
            <Button asChild variant="outline" className="mt-4">
               <Link href="/dashboard">Return to Dashboard</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
