
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mic, MicOff, ShieldAlert, CheckCircle, XCircle } from "lucide-react";
import { analyzeDistressAudio, type AnalyzeDistressAudioOutput } from "@/ai/flows/analyze-distress-audio";
import { initiateSosProtocol } from "@/ai/flows/initiate-sos-protocol";

const COUNTDOWN_SECONDS = 10;

export default function SOSPage() {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();

    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [statusLog, setStatusLog] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const [isRecording, setIsRecording] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Authentication and permission guard
    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            toast({ variant: "destructive", title: t('not_authenticated_title'), description: t('must_be_logged_in_to_sos_desc') });
            router.replace("/login");
        } else {
             navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => console.log("Mic permission granted."))
                .catch(() => {
                    toast({ variant: "destructive", title: t('mic_access_denied_title'), description: t('mic_permission_sos_desc') });
                    router.replace("/dashboard");
                });
        }
    }, [user, authLoading, router, t, toast]);
    
    // Countdown and recording logic
    useEffect(() => {
        if (isConfirmed || !user) return;

        // Start recording immediately
        startRecording();

        const interval = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    handleConfirmSOS();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(interval);
            stopRecording();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConfirmed, user]);


    const addStatusLog = (message: string) => {
        setStatusLog(prev => [...prev, message]);
    };
    
    const startRecording = async () => {
        try {
            addStatusLog(t('sos_status_mic_activated'));
            setIsRecording(true);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.start();
        } catch (err) {
            addStatusLog(t('sos_status_audio_failed'));
            console.error("Recording failed:", err);
            toast({ variant: 'destructive', title: t('recording_failed_title'), description: t('could_not_capture_audio_desc')});
        }
    };
    
    const stopRecording = (): Promise<Blob | null> => {
        return new Promise(resolve => {
             if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
                mediaRecorderRef.current.onstop = () => {
                    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                    audioChunksRef.current = [];
                    // Stop all media tracks to turn off the recording indicator
                    mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
                    setIsRecording(false);
                    resolve(audioBlob);
                };
                mediaRecorderRef.current.stop();
            } else {
                resolve(null);
            }
        });
    };
    
    const handleConfirmSOS = async (immediate = false) => {
        if (isConfirmed) return;
        
        setIsConfirmed(true);
        addStatusLog(t('sos_status_confirmed'));

        // Stop recording and get the audio blob
        const audioBlob = await stopRecording();

        // Get location
        addStatusLog(t('sos_status_location'));
        let location: { lat: number, lng: number } | null = null;
        try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 });
            });
            location = { lat: position.coords.latitude, lng: position.coords.longitude };
        } catch (err) {
             addStatusLog(t('sos_status_location_failed'));
             toast({ variant: 'destructive', title: t('location_error_title'), description: t('could_not_get_location_desc')});
             setError(t('could_not_get_location_desc'));
             setIsFinished(true);
             return;
        }

        // Analyze audio
        let audioAnalysis: AnalyzeDistressAudioOutput | null = null;
        if (audioBlob) {
            addStatusLog(t('sos_status_analyzing_audio'));
            const base64Audio = await blobToBase64(audioBlob);
            try {
                audioAnalysis = await analyzeDistressAudio({ audioDataUri: base64Audio });
            } catch (e) {
                console.error("Audio analysis failed", e);
                addStatusLog("AI audio analysis failed to respond.");
            }
        }
        
        await triggerSOS(location, audioAnalysis);
    };

    const triggerSOS = async (location: { lat: number; lng: number; }, audioAnalysis: AnalyzeDistressAudioOutput | null) => {
        if (!user) return;

        addStatusLog(t('sos_status_sending_alerts'));

        try {
            const sosResult = await initiateSosProtocol({
                userId: user.uid,
                location,
                audioAnalysis,
            });

            if (!sosResult || !sosResult.success || !sosResult.incidentId) {
                 const errorMessage = sosResult?.message || t('could_not_send_sos_alerts_error');
                 throw new Error(errorMessage);
            }
            
            const incidentId = sosResult.incidentId;
            addStatusLog(t('sos_status_alerts_sent_efir_logged', { message: sosResult.message }));

            // Success: Now we can create an E-FIR
            toast({ title: "SOS Activated", description: "Alerts have been sent. You can now file an E-FIR." });
            router.replace(`/e-fir/${incidentId}`);

        } catch (err: any) {
            console.error("Critical failure in SOS protocol:", err);
            const errorMessage = err.message.includes('access token') ? t('sos_service_unavailable_error') : (err.message || t('could_not_send_sos_alerts_error'));
            setError(errorMessage);
            addStatusLog(`Error: ${errorMessage}`);
            toast({ variant: 'destructive', title: t('sos_failed_title'), description: errorMessage });
        } finally {
            setIsFinished(true);
        }
    };
    
    const handleCancel = () => {
        stopRecording();
        toast({ title: t('sos_cancelled_title'), description: t('no_alerts_sent_desc') });
        router.replace("/dashboard");
    };

    const blobToBase64 = (blob: Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    if (authLoading || !user) {
        return (
             <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    return (
        <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
            <div className="w-full max-w-md p-4 text-center space-y-6">
                {!isFinished ? (
                    <>
                        <h1 className="text-5xl font-bold font-headline text-destructive animate-pulse">{t('emergency_title')}</h1>
                        <div className="relative w-48 h-48 mx-auto">
                            <svg className="w-full h-full" viewBox="0 0 100 100">
                                <circle className="text-gray-700" strokeWidth="7" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50"/>
                                <circle
                                    className="text-destructive"
                                    strokeWidth="7"
                                    strokeDasharray={2 * Math.PI * 45}
                                    strokeDashoffset={(2 * Math.PI * 45) * (1 - countdown / COUNTDOWN_SECONDS)}
                                    strokeLinecap="round"
                                    stroke="currentColor"
                                    fill="transparent"
                                    r="45"
                                    cx="50"
                                    cy="50"
                                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 1s linear' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center text-5xl font-bold">
                                {countdown}
                            </div>
                        </div>
                        
                        <div>
                             <p className="text-gray-400">{t('sos_countdown_desc')}</p>
                            {isRecording && !isConfirmed && (
                                <p className="text-destructive/80 font-medium mt-2 flex items-center justify-center gap-2 animate-pulse">
                                    <Mic/> {t('recording_audio_text')}
                                </p>
                            )}
                        </div>

                        {isConfirmed ? (
                             <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin" />
                                <p className="font-semibold text-lg">{t('processing_sos_title')}</p>
                             </div>
                        ) : (
                             <div className="flex flex-col sm:flex-row gap-4">
                                <Button className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground" size="lg" onClick={() => handleConfirmSOS(true)}>{t('confirm_sos_now_button')}</Button>
                                <Button className="w-full" size="lg" variant="outline" onClick={handleCancel}>{t('cancel_button')}</Button>
                            </div>
                        )}
                    </>
                ) : (
                    <div>
                        {error ? (
                            <>
                                <XCircle className="h-20 w-20 text-destructive mx-auto" />
                                <h1 className="mt-4 text-3xl font-bold font-headline">{t('sos_failed_title')}</h1>
                                <Alert variant="destructive" className="mt-4 text-left bg-destructive/10 border-destructive/50">
                                    <ShieldAlert className="h-4 w-4" />
                                    <AlertTitle>Error Details</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            </>
                        ) : (
                             <>
                                <CheckCircle className="h-20 w-20 text-green-500 mx-auto" />
                                <h1 className="mt-4 text-3xl font-bold font-headline">{t('sos_protocol_activated_title')}</h1>
                                <p className="text-gray-400 mt-2">Alerts sent. You will be redirected shortly.</p>
                            </>
                        )}
                        <Button className="mt-6 w-full" onClick={() => router.replace('/dashboard')}>{t('go_to_dashboard_button')}</Button>
                    </div>
                )}
                 <div className="text-left text-xs text-gray-500 space-y-1 pt-4 border-t border-gray-700">
                    <p className="font-bold">Status Log:</p>
                    {statusLog.map((log, i) => <p key={i}>- {log}</p>)}
                </div>
            </div>
        </div>
    );
}
