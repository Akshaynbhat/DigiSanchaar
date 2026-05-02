
"use client";

import {
  APIProvider,
  Map,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { useLanguage } from "@/hooks/use-language";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, UserCheck } from "lucide-react";

type Member = {
    name: string;
    avatar?: string;
    lat?: number;
    lng?: number;
    isHelper?: boolean; // To distinguish simulated helpers
    digiId?: string;
}

type LiveLocationMapProps = {
    members: Member[];
}

export default function LiveLocationMap({ members }: LiveLocationMapProps) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const { t } = useLanguage();

  useEffect(() => {
    const membersWithLoc = members.filter(m => m.lat && m.lng);
    if (membersWithLoc.length > 0) {
      const totalLat = membersWithLoc.reduce((sum, member) => sum + member.lat!, 0);
      const totalLng = membersWithLoc.reduce((sum, member) => sum + member.lng!, 0);
      setCenter({ lat: totalLat / membersWithLoc.length, lng: totalLng / membersWithLoc.length });
    } else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCenter({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to a default location if geolocation fails
          setCenter({ lat: 28.6139, lng: 77.2090 });
        },
        { enableHighAccuracy: true }
      );
    }
  }, [members]);
  
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY_HERE') {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
        <p className="text-muted-foreground text-center p-4">
          {t('google_maps_api_key_not_configured_desc')}
        </p>
      </div>
    );
  }

  if (!center) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-muted/50 rounded-lg">
            <p className="text-muted-foreground">{t('loading_map_and_location_text')}</p>
        </div>
    );
  }

  return (
    <APIProvider apiKey={apiKey}>
        <Map
            mapId="digisanchaar-live-map"
            style={{ width: "100%", height: "100%", borderRadius: "inherit" }}
            defaultCenter={center}
            center={center}
            defaultZoom={14}
            gestureHandling={"greedy"}
            disableDefaultUI={true}
        >
            {members.map((member) => (
                member.lat && member.lng && (
                    <AdvancedMarker key={member.digiId || member.name} position={{ lat: member.lat, lng: member.lng }} title={member.name}>
                       <div className="w-8 h-8 rounded-full border-2 shadow-md flex items-center justify-center"
                          style={{ borderColor: member.isHelper ? 'hsl(var(--primary-foreground))' : 'hsl(var(--primary))', 
                                   backgroundColor: member.isHelper ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'
                                 }}
                       >
                           {member.isHelper ? <UserCheck className="text-primary-foreground size-4"/> : <User className="text-destructive-foreground size-4" />}
                       </div>
                    </AdvancedMarker>
                )
            ))}
        </Map>
    </APIProvider>
  );
}
