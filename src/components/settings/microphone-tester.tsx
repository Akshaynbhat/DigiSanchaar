
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, MicOff, Play, Square, Loader2 } from "lucide-react";
import { analyzeDistressAudio } from "@/ai/flows/analyze-distress-audio";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useLanguage } from "@/hooks/use-language";

export function MicrophoneTester() {
  const [isRecording, setIsRecording] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{ isDistress: boolean, keywords: string[], summary: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();
  const { t } = useLanguage();

  const getPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      return true;
    } catch (err) {
      console.error("Error accessing microphone:", err);
      toast({
        variant: "destructive",
        title: t('mic_access_denied_title'),
        description: t('mic_permission_browser_settings_desc'),
      });
      setHasPermission(false);
      return false;
    }
  };

  const startRecording = async () => {
    const permission = await getPermission();
    if (!permission) return;

    setAudioBlob(null);
    setAudioUrl(null);
    setAnalysisResult(null);
    setIsRecording(true);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm' });

    mediaRecorderRef.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorderRef.current.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      setAudioBlob(blob);
      setAudioUrl(URL.createObjectURL(blob));
      audioChunksRef.current = [];
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorderRef.current.start();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const analyzeRecording = async () => {
    if (!audioBlob) return;
    
    setIsAnalyzing(true);
    setAnalysisResult(null);

    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = async () => {
      const base64Audio = reader.result as string;
      if (base64Audio) {
        try {
          const result = await analyzeDistressAudio({ audioDataUri: base64Audio });
          setAnalysisResult(result);
           toast({
            title: t('analysis_complete_title'),
            description: t('ai_processed_audio_desc'),
          });
        } catch (e) {
          console.error("Audio analysis failed:", e);
           toast({
            variant: "destructive",
            title: t('analysis_failed_title'),
            description: t('could_not_process_audio_desc'),
          });
        } finally {
          setIsAnalyzing(false);
        }
      }
    };
  }

  return (
    <div className="space-y-4">
      {hasPermission === false && (
        <Alert variant="destructive">
          <MicOff className="h-4 w-4" />
          <AlertTitle>{t('mic_access_required_title')}</AlertTitle>
          <AlertDescription>
            {t('mic_permission_feature_desc')}
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        {!isRecording ? (
          <Button onClick={startRecording}>
            <Mic className="mr-2" /> {t('start_recording_button')}
          </Button>
        ) : (
          <Button onClick={stopRecording} variant="destructive">
            <Square className="mr-2" /> {t('stop_recording_button')}
          </Button>
        )}
      </div>

       {isRecording && (
        <div className="flex items-center gap-2 text-destructive font-medium animate-pulse">
            <Mic /> {t('recording_text')}
        </div>
      )}

      {audioUrl && (
        <div className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">{t('recording_complete_title')}</h4>
            <audio src={audioUrl} controls className="w-full" />
            <Button onClick={analyzeRecording} disabled={isAnalyzing}>
                {isAnalyzing && <Loader2 className="mr-2 animate-spin" />}
                {t('analyze_audio_button')}
            </Button>
        </div>
      )}
      
      {analysisResult && (
        <div className="text-left space-y-2 mt-4 p-4 border rounded-lg">
            <h4 className="font-semibold">{t('ai_analysis_result_title')}:</h4>
             <p className="text-sm">
                <span className="font-medium">Distress Detected: </span>
                <Badge variant={analysisResult.isDistress ? 'destructive' : 'default'}>
                    {analysisResult.isDistress ? 'Yes' : 'No'}
                </Badge>
            </p>
            <p className="text-sm text-muted-foreground"><span className="font-medium text-foreground">Summary:</span> {analysisResult.summary}</p>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">{t('keywords_label')}:</span>
                {analysisResult.keywords.map(kw => <Badge key={kw} variant="secondary">{kw}</Badge>)}
                {analysisResult.keywords.length === 0 && <span className="text-sm text-muted-foreground">{t('none_detected_text')}</span>}
            </div>
        </div>
      )}
    </div>
  );
}
