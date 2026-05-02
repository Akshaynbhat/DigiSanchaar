
"use client";

import { useEffect, useRef, useState } from "react";
import LiveLocationMap from "@/components/trip-planner/live-location-map";
import { AlertTriangle, User, UserCheck, VolumeX, Volume2 } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

// Simulate a person in distress and nearby helpers
const personInDistress = { name: "Person in Distress", lat: 28.6139, lng: 77.2090 };
const nearbyHelpers = [
    { name: "Community Helper 1", lat: 28.615, lng: 77.21, isHelper: true },
    { name: "Community Helper 2", lat: 28.612, lng: 77.205, isHelper: true },
    { name: "You", lat: 28.618, lng: 77.215, isHelper: true },
];

export default function CommunityAlertPage() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const { t } = useLanguage();

    useEffect(() => {
        const audio = new Audio('/beep.mp3');
        audio.loop = true;
        audioRef.current = audio;

        // Browsers often block autoplay until user interaction
        const playPromise = audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn("Autoplay was blocked. User interaction is needed to play the sound.", error);
                // We can show a button to the user to enable sound in a real scenario
            });
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, []);
    
    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !audioRef.current.muted;
            setIsMuted(audioRef.current.muted);
        }
    }

    const allMapMarkers = [personInDistress, ...nearbyHelpers];

    return (
        <div className="h-full w-full flex flex-col">
            <div className="bg-destructive text-destructive-foreground p-4 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="h-8 w-8" />
                    <h1 className="text-2xl font-bold font-headline">{t('nearby_sos_alert_title')}</h1>
                </div>
                <p>{t('nearby_sos_alert_desc')}</p>
            </div>

            <div className="flex-grow relative">
                <LiveLocationMap members={allMapMarkers} />
                
                <div className="absolute top-4 right-4 space-y-2">
                    <div className="bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg max-w-xs">
                        <h3 className="font-bold mb-2">{t('legend_title')}</h3>
                        <div className="flex items-center gap-2 text-sm">
                           <div className="w-6 h-6 rounded-full border-2 border-primary-foreground shadow-md flex items-center justify-center bg-destructive">
                                <User className="text-destructive-foreground size-4" />
                            </div>
                           <span>{t('person_in_distress_label')}</span>
                        </div>
                         <div className="flex items-center gap-2 text-sm mt-2">
                            <div className="w-6 h-6 rounded-full border-2 border-primary-foreground shadow-md flex items-center justify-center bg-green-500">
                                <UserCheck className="text-primary-foreground size-4" />
                            </div>
                           <span>{t('community_helpers_label')}</span>
                        </div>
                    </div>

                     <button onClick={toggleMute} className="bg-background/80 backdrop-blur-sm rounded-lg p-3 shadow-lg flex items-center gap-2 text-sm font-medium">
                        {isMuted ? <VolumeX className="h-5 w-5"/> : <Volume2 className="h-5 w-5"/>}
                        <span>{isMuted ? t('unmute_button') : t('mute_button')}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
