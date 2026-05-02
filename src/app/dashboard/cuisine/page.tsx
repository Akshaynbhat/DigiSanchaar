
"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UtensilsCrossed, Loader2, MapPin } from "lucide-react";
import { getCuisineRecommendations, type GetCuisineRecommendationsOutput } from "@/ai/flows/get-cuisine-recommendations";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

const indianCities = ["Delhi", "Mumbai", "Jaipur", "Kolkata", "Chennai", "Hyderabad"];

export default function CuisinePage() {
    const [selectedCity, setSelectedCity] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<GetCuisineRecommendationsOutput | null>(null);
    const { toast } = useToast();

    const handleFetchRecommendations = async () => {
        if (!selectedCity) {
            toast({ variant: "destructive", title: "Please select a city." });
            return;
        }
        setIsLoading(true);
        setRecommendations(null);
        try {
            const result = await getCuisineRecommendations({ city: selectedCity });
            setRecommendations(result);
        } catch (error) {
            console.error("Error fetching recommendations:", error);
            toast({ variant: "destructive", title: "Recommendation Failed", description: "Could not fetch cuisine recommendations for the selected city." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">Cuisine Explorer</h1>
                <p className="text-muted-foreground">Get AI-powered food recommendations for popular Indian cities.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>City Selection</CardTitle>
                    <CardDescription>Choose a city to discover its must-try dishes and where to find them.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-2">
                    <Select value={selectedCity} onValueChange={setSelectedCity}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a city..." />
                        </SelectTrigger>
                        <SelectContent>
                            {indianCities.map(city => (
                                <SelectItem key={city} value={city}>{city}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleFetchRecommendations} disabled={isLoading || !selectedCity}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <UtensilsCrossed className="mr-2" />}
                        Get Recommendations
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="mt-4 text-xl font-semibold">Finding the best food in {selectedCity}...</h2>
                    <p className="mt-1 text-muted-foreground">Our AI is consulting its inner foodie to bring you tasty recommendations.</p>
                </div>
            )}
            
            {recommendations && recommendations.dishes.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {recommendations.dishes.map((dish) => (
                         <Card key={dish.name} className="flex flex-col">
                            <CardHeader>
                               <CardTitle className="font-headline text-xl">{dish.name}</CardTitle>
                               <CardDescription className="pt-1">{dish.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Separator />
                                <div className="mt-4">
                                     <h4 className="text-sm font-semibold mb-2 flex items-center gap-2 text-primary">
                                        <MapPin className="size-4" />
                                        Where to try
                                     </h4>
                                     <ul className="space-y-1 list-disc pl-5 text-muted-foreground text-sm">
                                        {dish.famousPlaces.map(place => <li key={place}>{place}</li>)}
                                     </ul>
                                </div>
                            </CardContent>
                         </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
