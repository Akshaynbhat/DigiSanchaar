
"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Users, MapPin, Loader2, FilePlus, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";
import { Button } from "../ui/button";

export function CurrentTrips() {
    const { user, loading: authLoading, planningTrips } = useAuth();
    const { t } = useLanguage();

    const isLoading = authLoading;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2">
                    {t('qa_your_trips_title')}
                </CardTitle>
                <CardDescription>
                    Review your ongoing and upcoming trips.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-20">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : planningTrips.length === 0 ? (
                     <div className="flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-lg">
                        <FilePlus className="h-10 w-10 text-muted-foreground" />
                        <h2 className="mt-4 text-lg font-semibold">{t('no_active_trips_title')}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{t('no_active_trips_desc')}</p>
                         <Link href="/groups" className="mt-4">
                            <Button> {t('create_trip_button')}</Button>
                        </Link>
                    </div>
                ) : (
                    planningTrips.map(trip => (
                        <div key={trip.id} className="block bg-muted/50 p-4 rounded-lg -m-4">
                            <div className="flex flex-col sm:flex-row justify-between gap-4">
                                <div className="space-y-2 flex-grow">
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
                                     <p className="text-xs text-muted-foreground pt-1">
                                        {t('starts_on_text')} {new Date(trip.startDate.seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                
                                <div className="flex-shrink-0 flex items-center justify-end">
                                     <Link href={`/trip/${trip.id}`} passHref>
                                        <Button variant="outline">
                                        <Pencil className="mr-2 h-4 w-4" />
                                        {t('do_your_planning_button')}
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}

