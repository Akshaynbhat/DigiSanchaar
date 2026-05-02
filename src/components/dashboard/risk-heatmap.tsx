
"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { AlertTriangle, MapPin } from "lucide-react";

type Location = {
    name: string;
    lat: number;
    lng: number;
}

type RiskHeatmapProps = {
    locations: Location[];
}

export default function RiskHeatmap({ locations }: RiskHeatmapProps) {
  const [center, setCenter] =
    useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // If itinerary locations are provided, use their center
    if (locations && locations.length > 0) {
        const totalLat = locations.reduce((sum, loc) => sum + loc.lat, 0);
        const totalLng = locations.reduce((sum, loc) => sum + loc.lng, 0);
        setCenter({ lat: totalLat / locations.length, lng: totalLng / locations.length });
    } else {
         // Fallback to user's current location if no itinerary is set
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCenter({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                });
            },
            () => {
                // Default to a central location for demonstration if all else fails.
                setCenter({ lat: 28.6139, lng: 77.209 });
            },
            { enableHighAccuracy: true }
        );
    }
  }, [locations]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground text-center p-4">
          Google Maps API Key is not configured.
          <br /> Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in a .env file.
        </p>
      </div>
    );
  }

  if (!center) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">Loading map and location...</p>
        </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="digisanchaar-map"
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
        defaultCenter={center}
        center={center}
        defaultZoom={11}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapTypeControl={false}
      >
        {locations.map((zone, index) => (
            <AdvancedMarker key={index} position={{ lat: zone.lat, lng: zone.lng }} title={zone.name}>
                <div className="relative">
                    <AlertTriangle className="text-destructive size-6 drop-shadow-md" />
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-destructive"></span>
                    </span>
                </div>
            </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
