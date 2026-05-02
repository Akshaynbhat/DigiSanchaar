
"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export function SOSButton() {
  const { t } = useLanguage();

  return (
    <Link href="/sos" className="relative h-40 w-40 sm:h-48 sm:w-48">
      <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse-slow"></div>
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-destructive text-destructive-foreground rounded-full shadow-lg hover:bg-destructive/90 transition-colors">
        <ShieldAlert className="size-16 sm:size-20" />
        <span className="mt-2 text-2xl sm:text-3xl font-bold font-headline">{t('emergency_title')}</span>
      </div>
    </Link>
  );
}
