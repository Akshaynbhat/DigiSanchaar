
"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function HomePage() {
  const router = useRouter();
  const { t } = useLanguage();

  useEffect(() => {
    // This root page's only job is to redirect to the login page.
    router.replace("/login");
  }, [router]);

  // Display a loading indicator while redirecting.
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground">{t('loading_experience_text')}</p>
    </div>
  );
}
