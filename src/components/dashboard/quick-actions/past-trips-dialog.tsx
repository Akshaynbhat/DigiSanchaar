
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PastTripsContent } from "@/components/dashboard/past-trips";
import { useLanguage } from "@/hooks/use-language";


export function PastTripsDialog({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
           <DialogHeader>
              <DialogTitle>{t('past_trips_title')}</DialogTitle>
              <DialogDescription>
                  {t('past_trips_desc')}
              </DialogDescription>
          </DialogHeader>
          <PastTripsContent />
      </DialogContent>
    </Dialog>
  );
}
