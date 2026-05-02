
"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History, MapPin, Users, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";
import { ScrollArea } from "../ui/scroll-area";

export function PastTripsContent() {
    const { user, loading: authLoading, completedTrips } = useAuth();
    const { t } = useLanguage();

    const getScoreColor = (score: number) => {
        if (score < 40) return "bg-destructive";
        if (score < 70) return "bg-yellow-500";
        return "bg-green-500";
    };

    const isLoading = authLoading;

    return (
        <ScrollArea className="h-96">
            <div className="space-y-4 pr-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : completedTrips.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">{t('no_past_trips_text')}</p>
                ) : (
                    completedTrips.map(trip => (
                        <div key={trip.id} className="block bg-muted/50 p-4 rounded-lg">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-2">
                                    <h3 className="font-semibold">{trip.name}</h3>
                                    
                                    <div className="flex items-center space-x-2">
                                        <Users className="h-4 w-4 text-muted-foreground" />
                                        <div className="flex -space-x-2 overflow-hidden">
                                            {trip.members.map((member, index) => (
                                                <Avatar key={`${member.digiId}-${index}`} className="inline-block border-2 border-background h-6 w-6">
                                                    <AvatarImage src={member.avatar} />
                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {t('members_count', { count: trip.members.length })}
                                        </span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                                        <div className="flex flex-wrap gap-1">
                                            {trip.itinerary?.map(city => (
                                                <Badge key={city.name} variant="secondary" className="text-xs">{city.name}</Badge>
                                            )).flat()}
                                        </div>
                                    </div>
                                </div>
                                
                                {trip.safetyScore !== undefined && trip.safetyScore !== null && (
                                     <div className="flex-shrink-0 flex items-center justify-end">
                                        <Badge className={`${getScoreColor(trip.safetyScore)} text-white hover:${getScoreColor(trip.safetyScore)}`}>
                                            {t('safety_score_label')}: {trip.safetyScore}/100
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </ScrollArea>
    );
}
