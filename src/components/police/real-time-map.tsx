
"use client";

import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { User, AlertTriangle } from "lucide-react";

type Tourist = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: 'safe' | 'distress';
}

type RealTimeMapProps = {
    tourists: Tourist[];
}

export function RealTimeMap({ tourists }: RealTimeMapProps) {
  const [center, setCenter] = useState({ lat: 28.6139, lng: 77.2090 }); // Default to Delhi

  useEffect(() => {
    if (tourists && tourists.length > 0) {
      const totalLat = tourists.reduce((sum, t) => sum + t.lat, 0);
      const totalLng = tourists.reduce((sum, t) => sum + t.lng, 0);
      setCenter({ lat: totalLat / tourists.length, lng: totalLng / tourists.length });
    }
  }, [tourists]);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground text-center p-4 text-xs">
          Google Maps API Key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment.
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
      <Map
        mapId="police-dashboard-map"
        style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
        center={center}
        zoom={11}
        gestureHandling={"greedy"}
        disableDefaultUI={true}
        mapTypeControl={false}
      >
        {tourists.map((tourist) => (
            <AdvancedMarker key={tourist.id} position={{ lat: tourist.lat, lng: tourist.lng }} title={tourist.name}>
                {tourist.status === 'distress' ? (
                    <div className="relative">
                        <AlertTriangle className="text-destructive size-8 drop-shadow-lg animate-pulse" fill="yellow" />
                    </div>
                ) : (
                    <Pin>
                        <User className="size-4" />
                    </Pin>
                )}
            </AdvancedMarker>
        ))}
      </Map>
    </APIProvider>
  );
}
