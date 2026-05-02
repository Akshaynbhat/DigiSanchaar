"use client";

import { QuickActions } from '@/components/dashboard/quick-actions';
import { CurrentTrips } from '@/components/dashboard/current-trips';
import { VoiceCommander } from '@/components/dashboard/voice-commander';
import { useLanguage } from '@/hooks/use-language';
import { Card, CardContent } from '@/components/ui/card';

export default function DashboardPage() {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Actions Column */}
      <div className="lg:col-span-2 space-y-6">
        <QuickActions />
        <CurrentTrips />
      </div>

      {/* Side Column for Voice Commander */}
      <div className="lg:col-span-1 flex flex-col">
        <Card className="flex-grow flex flex-col items-center justify-center p-6 border">
          <CardContent className="flex items-center justify-center p-0">
             <VoiceCommander
              activationMessage={t('voice_commander_activation')}
              listeningMessage={t('voice_commander_listening')}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
