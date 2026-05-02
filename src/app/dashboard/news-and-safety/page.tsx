"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Newspaper, Shield, Loader2, BarChart, FileText, CloudSun } from "lucide-react";
import { getCitySafetyInfo, type GetCitySafetyInfoOutput } from "@/ai/flows/get-city-safety-info";
import { getWeatherInfo, type GetWeatherInfoOutput } from "@/ai/flows/get-weather-info";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const indianCities = ["Delhi", "Mumbai", "Goa", "Jaipur", "Bangalore", "Kolkata", "Chennai", "Hyderabad"];

export default function NewsAndSafetyPage() {
    const [selectedCity, setSelectedCity] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [safetyInfo, setSafetyInfo] = useState<GetCitySafetyInfoOutput | null>(null);
    const [weatherInfo, setWeatherInfo] = useState<GetWeatherInfoOutput | null>(null);
    const { toast } = useToast();

    const handleFetchInfo = async () => {
        if (!selectedCity) {
            toast({ variant: "destructive", title: "Please select a city." });
            return;
        }
        setIsLoading(true);
        setSafetyInfo(null);
        setWeatherInfo(null);
        try {
            const [safetyResult, weatherResult] = await Promise.all([
                getCitySafetyInfo({ city: selectedCity }),
                getWeatherInfo({ city: selectedCity }),
            ]);
            setSafetyInfo(safetyResult);
            setWeatherInfo(weatherResult);
        } catch (error) {
            console.error("Error fetching city info:", error);
            toast({ variant: "destructive", title: "Analysis Failed", description: "Could not fetch information for the selected city." });
        } finally {
            setIsLoading(false);
        }
    };
    
    const getScoreColor = (score: number) => {
        if (score < 40) return "bg-destructive text-destructive-foreground";
        if (score < 70) return "bg-yellow-500 text-yellow-foreground";
        return "bg-green-500 text-green-foreground";
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-headline font-bold">News & Safety Explorer</h1>
                <p className="text-muted-foreground">Get AI-powered safety and weather insights for cities before you plan your trip.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>City Selection</CardTitle>
                    <CardDescription>Choose a city to get its latest safety score, weather, and news summary.</CardDescription>
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
                    <Button onClick={handleFetchInfo} disabled={isLoading || !selectedCity}>
                        {isLoading ? <Loader2 className="mr-2 animate-spin" /> : <Shield className="mr-2" />}
                        Analyze City
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                 <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <h2 className="mt-4 text-xl font-semibold">Analyzing {selectedCity}...</h2>
                    <p className="mt-1 text-muted-foreground">Our AI is gathering the latest safety and weather insights for you.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {safetyInfo && (
                    <>
                        <Card className="md:col-span-1">
                             <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2 text-lg"><BarChart/> Safety Score</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col items-center justify-center text-center gap-2">
                                 <Badge className={`${getScoreColor(safetyInfo.safetyScore)} text-5xl font-bold h-24 w-24 rounded-full flex items-center justify-center`}>
                                    {safetyInfo.safetyScore}
                                </Badge>
                                <p className="text-muted-foreground text-sm">out of 100</p>
                            </CardContent>
                        </Card>
                         <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle className="font-headline flex items-center gap-2 text-lg"><FileText /> Safety Summary</CardTitle>
                            </CardHeader>
                            <CardContent>
                               <p className="text-muted-foreground">{safetyInfo.summary}</p>
                            </CardContent>
                        </Card>
                    </>
                )}
                
                {weatherInfo && weatherInfo.temperature && (
                     <Card className="md:col-span-1">
                         <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg"><CloudSun /> Weather</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center text-center gap-2">
                             <div className="text-5xl font-bold flex items-start">
                                {Math.round(weatherInfo.temperature)}
                                <span className="text-2xl font-medium mt-1">°C</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {weatherInfo.icon && <img src={weatherInfo.icon} alt={weatherInfo.description} className="h-8 w-8" />}
                                <p className="text-muted-foreground capitalize">{weatherInfo.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {safetyInfo && (
                     <Card className={weatherInfo ? "md:col-span-2" : "md:col-span-3"}>
                        <CardHeader>
                            <CardTitle className="font-headline flex items-center gap-2 text-lg"><Newspaper/> Recent Headlines</CardTitle>
                        </CardHeader>
                        <CardContent>
                           <ul className="space-y-2 list-disc pl-5 text-muted-foreground">
                                {safetyInfo.newsHeadlines.map((headline, index) => (
                                    <li key={index}>{headline}</li>
                                ))}
                           </ul>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
