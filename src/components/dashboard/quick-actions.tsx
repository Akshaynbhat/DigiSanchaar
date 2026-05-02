
"use client";

import Link from "next/link";
import { Users, FileText, History, Phone } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { ActionCard } from "@/components/dashboard/quick-actions/action-card";
import { PastTripsDialog } from "@/components/dashboard/quick-actions/past-trips-dialog";
import { ImportantContactsDialog } from "@/components/dashboard/quick-actions/important-contacts-dialog";

export function QuickActions() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/groups">
            <ActionCard title={t('qa_your_trips_title')} icon={Users} />
        </Link>
        <Link href="/e-fir">
            <ActionCard title={t('qa_e_fir_reports_title')} icon={FileText} />
        </Link>
        <PastTripsDialog>
            <ActionCard title={t('past_trips_title')} icon={History} />
        </PastTripsDialog>
        <ImportantContactsDialog>
            <ActionCard title={'Important Contacts'} icon={Phone} />
        </ImportantContactsDialog>
    </div>
  );
}
