
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, updateDoc, Timestamp } from "firebase/firestore";
import type { DocumentData } from "firebase/firestore";
import { generateTripSafetyScore, type GenerateTripSafetyScoreOutput } from "@/ai/flows/generate-trip-safety-score";
import { getPopularPlaces } from "@/ai/tools/get-popular-places";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, PlusCircle, Trash2, Shield, Users, MapPin, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import RiskHeatmap from "@/components/dashboard/risk-heatmap";


type Member = {
  name: string;
  avatar: string;
  digiId: string;
  lat?: number;
  lng?: number;
};

type ItineraryItem = {
    name: string; // city name
    places: string[];
}

type Trip = {
  id: string;
  name:string;
  startDate: Timestamp;
  members: Member[];
  memberIds: string[];
  itinerary?: ItineraryItem[];
  safetyScore?: number;
  riskAssessment?: string;
  locations?: GenerateTripSafetyScoreOutput['locations'];
};

const indianCities = ["Delhi", "Mumbai", "Goa", "Jaipur", "Bangalore"];


export default function TripPlanningPage() {
    const params = useParams();
    const router = useRouter();
    const tripId = params.tripId as string;

    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    
    const [trip, setTrip] = useState<Trip | null>(null);
    const [loading, setLoading] = useState(true);
    
    const [selectedCity, setSelectedCity] = useState("");
    const [availablePlaces, setAvailablePlaces] = useState<string[]>([]);
    const [selectedPlaces, setSelectedPlaces] = useState<string[]>([]);
    const [loadingPlaces, setLoadingPlaces] = useState(false);

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // --- Data Fetching ---
    useEffect(() => {
        if (!tripId || authLoading) return;

        if (!user) {
            router.replace('/login');
            return;
        }

        const tripDocRef = doc(db, "trips", tripId);
        const unsubscribe = onSnapshot(tripDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const tripData = { id: docSnap.id, ...docSnap.data() } as Trip;
                // Security check: ensure current user is a member of the trip
                if (!tripData.memberIds.includes(user.uid)) {
                     toast({ variant: "destructive", title: "Access Denied", description: "You are not a member of this trip." });
                     router.push('/groups');
                     return;
                }
                setTrip(tripData);
            } else {
                toast({ variant: "destructive", title: "Trip Not Found" });
                router.push('/groups');
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching trip:", error);
            toast({ variant: "destructive", title: t('error_title'), description: "Could not load trip data." });
            setLoading(false);
        });

        return () => unsubscribe();
    }, [tripId, user, authLoading, router, t, toast]);


    // --- Itinerary Logic ---
    useEffect(() => {
        const fetchPlaces = async () => {
            if (!selectedCity) {
                setAvailablePlaces([]);
                setSelectedPlaces([]);
                return;
            }
            setLoadingPlaces(true);
            try {
                const places = await getPopularPlaces({ city: selectedCity });
                setAvailablePlaces(places);
            } catch (error) {
                console.error(`Could not fetch places for ${selectedCity}`, error);
                toast({ variant: "destructive", title: t('error_title'), description: t('could_not_fetch_places_desc', { cityName: selectedCity }) });
            } finally {
                setLoadingPlaces(false);
            }
        };
        fetchPlaces();
    }, [selectedCity, toast, t]);

    const addCityToItinerary = () => {
        if (!selectedCity || selectedPlaces.length === 0 || !trip) return;

        const updatedItinerary = [...(trip.itinerary || [])];
        const existingCityIndex = updatedItinerary.findIndex(item => item.name === selectedCity);

        if (existingCityIndex > -1) {
            // Update existing city's places
            const existingPlaces = new Set(updatedItinerary[existingCityIndex].places);
            selectedPlaces.forEach(p => existingPlaces.add(p));
            updatedItinerary[existingCityIndex].places = Array.from(existingPlaces);
        } else {
            // Add new city and its places
            updatedItinerary.push({ name: selectedCity, places: selectedPlaces });
        }
        
        updateTripInDb({ itinerary: updatedItinerary });
        setSelectedCity("");
        setSelectedPlaces([]);
    };
    
    const removePlaceFromItinerary = (cityName: string, placeToRemove: string) => {
        if (!trip || !trip.itinerary) return;

        const updatedItinerary = trip.itinerary.map(city => {
            if (city.name === cityName) {
                return { ...city, places: city.places.filter(p => p !== placeToRemove) };
            }
            return city;
        }).filter(city => city.places.length > 0); // Remove city if it has no places left

        updateTripInDb({ itinerary: updatedItinerary });
    };

    const handleSafetyAnalysis = async () => {
        if (!trip || !trip.itinerary || trip.itinerary.length === 0) {
            toast({ variant: "destructive", title: t('itinerary_too_short_title'), description: t('itinerary_too_short_desc') });
            return;
        }
        setIsAnalyzing(true);
        try {
            const itineraryString = trip.itinerary.map(city => `${city.name}: ${city.places.join(', ')}`).join('; ');
            const result = await generateTripSafetyScore({
                itinerary: itineraryString,
                locationData: "Standard public data on crime rates and tourist safety reports for India."
            });
            
            await updateTripInDb({
                safetyScore: result.safetyScore,
                riskAssessment: result.riskAssessment,
                locations: result.locations,
            });
            toast({ title: "Analysis Complete", description: "Safety score and risk assessment have been generated."});

        } catch (error) {
            console.error("Error generating safety score:", error);
            toast({ variant: "destructive", title: t('error_title'), description: t('could_not_generate_safety_score_desc') });
        } finally {
            setIsAnalyzing(false);
        }
    };
    
    const updateTripInDb = async (dataToUpdate: Partial<Trip>) => {
        if (!tripId) return;
        const tripDocRef = doc(db, "trips", tripId);
        try {
            await updateDoc(tripDocRef, dataToUpdate);
        } catch (error) {
             console.error("Failed to update trip:", error);
             toast({ variant: "destructive", title: t('error_title'), description: t('could_not_save_itinerary_desc') });
        }
    };
    
    // --- Render Logic ---

    if (loading || authLoading) {
        return (
            <div className="flex h-full flex-col items-center justify-center text-center p-12">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <h1 className="mt-4 text-xl font-semibold">Loading Trip Details...</h1>
            </div>
        );
    }

    if (!trip) {
        return <div className="text-center p-12">Trip not found or you do not have access.</div>;
    }

    const getScoreColor = (score: number) => {
        if (score < 40) return "bg-destructive text-destructive-foreground";
        if (score < 70) return "bg-yellow-500 text-yellow-foreground";
        return "bg-green-500 text-green-foreground";
    };

    return (
        <div className="space-y-6">
             <header className="space-y-1">
                <h1 className="text-3xl font-bold font-headline">{trip.name}</h1>
                <p className="text-muted-foreground">
                    {t('starts_on_text')} {trip.startDate.toDate().toLocaleDateString(undefined, { dateStyle: 'long' })}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Itinerary Planning Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Pencil /> {t('trip_itinerary_and_safety_title')}</CardTitle>
                            <CardDescription>{t('trip_itinerary_and_safety_desc')}</CardDescription>
                        </CardHeader>
                         <CardContent className="space-y-4">
                            {/* Current Itinerary */}
                            {trip.itinerary && trip.itinerary.length > 0 ? (
                                <div className="space-y-3">
                                    {trip.itinerary.map(city => (
                                        <div key={city.name} className="p-3 bg-muted/50 rounded-md">
                                            <h4 className="font-semibold mb-2">{city.name}</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {city.places.map(place => (
                                                    <Badge key={place} variant="secondary" className="flex items-center gap-1">
                                                        {place}
                                                        <button onClick={() => removePlaceFromItinerary(city.name, place)} className="rounded-full hover:bg-destructive/20 p-0.5">
                                                            <Trash2 className="h-3 w-3 text-destructive" />
                                                        </button>
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">Your itinerary is empty. Add a city to get started.</p>
                            )}

                            {/* Add to Itinerary Form */}
                            <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                                <Select value={selectedCity} onValueChange={setSelectedCity}>
                                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue placeholder={t('select_a_city_placeholder')} /></SelectTrigger>
                                    <SelectContent>
                                        {indianCities.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select 
                                    disabled={!selectedCity || loadingPlaces}
                                    value={selectedPlaces[0] || ""} // Simplified for single selection for now
                                    onValueChange={(place) => setSelectedPlaces([place])}
                                >
                                     <SelectTrigger>
                                        <SelectValue placeholder={loadingPlaces ? t('loading_places_text') : t('select_places_to_visit_label')} />
                                    </SelectTrigger>
                                     <SelectContent>
                                        {availablePlaces.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button onClick={addCityToItinerary} disabled={!selectedCity || selectedPlaces.length === 0}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> {t('add_city_button')}
                                </Button>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleSafetyAnalysis} disabled={isAnalyzing || !trip.itinerary || trip.itinerary.length === 0}>
                                {isAnalyzing ? <Loader2 className="mr-2 animate-spin h-4 w-4" /> : <Shield className="mr-2 h-4 w-4" />}
                                {t('analyze_safety_button')}
                            </Button>
                        </CardFooter>
                    </Card>
                    
                    {/* Safety Analysis & Map Card */}
                    {(trip.safetyScore !== undefined && trip.locations) && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2"><Shield /> {t('trip_safety_analysis_title')}</CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold">{t('safety_score_label')}</p>
                                        <Badge className={`${getScoreColor(trip.safetyScore)} text-lg`}>{trip.safetyScore} / 100</Badge>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-1">{t('risk_assessment_title')}</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{trip.riskAssessment}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                     <h4 className="font-semibold mb-1">{t('risk_zone_heatmap_title')}</h4>
                                     <div className="aspect-square bg-muted rounded-lg">
                                        <RiskHeatmap locations={trip.locations || []} />
                                     </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-6">
                    {/* Trip Members Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2"><Users /> {t('trip_members_title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             {trip.members.map(member => (
                                <div key={member.digiId} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar>
                                            <AvatarImage src={member.avatar} />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span>{member.name}</span>
                                    </div>
                                    {member.lat && member.lng ? (
                                        <Link href={`https://www.google.com/maps/search/?api=1&query=${member.lat},${member.lng}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="outline" size="sm">
                                                <MapPin className="mr-2 h-3 w-3"/>
                                                View on Map
                                            </Button>
                                        </Link>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">Location N/A</span>
                                    )}
                                </div>
                             ))}
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}

    