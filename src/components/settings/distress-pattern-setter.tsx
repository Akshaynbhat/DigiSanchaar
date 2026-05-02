
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";

const MAX_TAPS = 5;

export function DistressPatternSetter() {
  const [taps, setTaps] = useState<number[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [lastTapTime, setLastTapTime] = useState(0);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
     if (authLoading || !user) return;

     const userDocRef = doc(db, "users", user.uid);
     
     const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.distressPattern) {
                setTaps(data.distressPattern);
            }
        }
     });

     return () => unsubscribe();
  }, [user, authLoading]);

  const handleTap = () => {
    if (!isRecording) return;

    const now = Date.now();
    if (lastTapTime > 0) {
      const interval = now - lastTapTime;
      setTaps((prev) => [...prev, interval]);
    }
    setLastTapTime(now);

    if (taps.length + 1 >= MAX_TAPS) {
      stopRecording();
    }
  };

  const startRecording = () => {
    setTaps([]);
    setLastTapTime(0);
    setIsRecording(true);
  };
  
  const savePattern = async (newTaps: number[]) => {
      if (!user) return;
      const userDocRef = doc(db, "users", user.uid);
      try {
        await setDoc(userDocRef, { distressPattern: newTaps }, { merge: true });
        toast({
            title: t('pattern_saved_title'),
            description: t('pattern_saved_desc', { count: newTaps.length + 1 }),
        });
      } catch (error) {
        console.error("Failed to save distress pattern", error);
        toast({ variant: "destructive", title: t('save_failed_title') });
      }
  }
  
  const stopRecording = () => {
    setIsRecording(false);
    if (taps.length > 0) {
        savePattern(taps);
    }
  }

  const resetPattern = async () => {
    setTaps([]);
    setIsRecording(false);
    if (!user) return;
    const userDocRef = doc(db, "users", user.uid);
    try {
       await setDoc(userDocRef, { distressPattern: [] }, { merge: true });
        toast({ title: t('pattern_cleared_title') });
    } catch (error) {
      console.error("Failed to clear distress pattern", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button onClick={isRecording ? stopRecording : startRecording}>
          {isRecording ? t('stop_recording_button') : t('set_new_pattern_button')}
        </Button>
        {taps.length > 0 && !isRecording && (
          <Button variant="outline" onClick={resetPattern}>
            {t('reset_button')}
          </Button>
        )}
      </div>
      
      <div className="p-4 border rounded-lg min-h-[120px] flex flex-col items-center justify-center space-y-2">
        {isRecording ? (
          <>
            <p className="text-muted-foreground">{t('tap_button_to_record_pattern_desc')}</p>
            <button
                onClick={handleTap}
                className="w-24 h-24 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-lg font-bold transition-transform active:scale-95"
            >
                {t('tap_button')}
            </button>
            <p className="text-xs text-muted-foreground">{t('taps_recorded_text')}: {taps.length + (lastTapTime > 0 ? 1 : 0)} / {MAX_TAPS}</p>
          </>
        ) : (
          <div>
            {taps.length > 0 ? (
                <div className="flex flex-col items-center gap-2">
                    <p className="font-medium">{t('current_pattern_saved_text')}</p>
                    <div className="flex gap-2">
                        {Array.from({ length: taps.length + 1 }).map((_, i) => (
                            <Badge key={i} variant="secondary">{t('tap_text')} {i + 1}</Badge>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-muted-foreground">{t('no_custom_pattern_set_text')}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
