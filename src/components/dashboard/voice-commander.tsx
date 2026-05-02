
"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/use-language';

interface VoiceCommanderProps {
    activationMessage: string;
    listeningMessage: string;
}

const COMMAND_MAP: { [key: string]: string } = {
    'help': '/sos',
    'madad': '/sos',
    'sos': '/sos',
    'dashboard': '/dashboard',
    'home': '/dashboard',
    'trips': '/groups',
    'your trips': '/groups',
    'reports': '/e-fir',
    'fir': '/e-fir',
    'alerts': '/community-alert',
    'settings': '/settings',
    'profile': '/profile',
};


export function VoiceCommander({ activationMessage, listeningMessage }: VoiceCommanderProps) {
    const router = useRouter();
    const { toast } = useToast();
    const { t, language } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = false;
            recognition.lang = language; 
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript.toLowerCase().trim();
                console.log('Voice transcript:', transcript);
                
                // Enhanced command processing
                const command = Object.keys(COMMAND_MAP).find(key => transcript.includes(key));

                if (command) {
                    const path = COMMAND_MAP[command];
                    toast({
                        title: `${t('voice_command_understood_title')}: "${command}"`,
                        description: `${t('navigating_to_desc')} ${path}...`,
                    });
                    router.push(path);
                } else {
                     toast({
                        variant: 'destructive',
                        title: t('command_not_recognized_title'),
                        description: `${t('could_not_understand_command_desc')}: "${transcript}"`,
                    });
                }
                
                setIsListening(false);
            };

            recognition.onerror = (event) => {
                console.error('Speech recognition error', event.error);
                 toast({
                    variant: 'destructive',
                    title: t('voice_recognition_error_title'),
                    description: event.error === 'not-allowed' ? t('permission_denied_desc') : t('an_error_occurred_desc'),
                });
                setIsListening(false);
            };
            
            recognition.onend = () => {
                // Ensure the listening state is always turned off when recognition ends.
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, [router, toast, t, language]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            toast({
                variant: 'destructive',
                title: t('unsupported_browser_title'),
                description: t('voice_recognition_unsupported_desc'),
            });
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
            // onend will handle setting isListening to false
        } else {
            // Request microphone permission and start listening
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then(() => {
                    recognitionRef.current.start();
                    setIsListening(true);
                })
                .catch(err => {
                    console.error("Mic permission error:", err);
                    toast({
                        variant: 'destructive',
                        title: t('mic_access_denied_title'),
                        description: t('mic_permission_desc'),
                    });
                });
        }
    };
    
    const Icon = isListening ? Mic : MicOff;

    return (
        <div className="flex flex-col items-center gap-2">
             <Button onClick={toggleListening} variant="outline" size="icon" className="rounded-full h-16 w-16">
                <Icon className={`h-8 w-8 transition-colors ${isListening ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
            </Button>
            <p className="text-xs text-muted-foreground">{isListening ? listeningMessage : t('voice_commander_tap_to_use')}</p>
        </div>
    );
}

// Ensure window object properties are defined for TypeScript
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
