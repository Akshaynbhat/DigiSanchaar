
"use client";

import { useEffect, useRef, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, updateDoc, Timestamp, setDoc, getDoc } from 'firebase/firestore';
import { geohashForLocation } from 'geofire-common';
import { useAuth } from '@/context/auth-context';

type Member = {
    name: string;
    avatar: string;
    digiId: string;
    lat?: number;
    lng?: number;
};

type Trip = {
    id: string;
    members: Member[];
    startDate: Timestamp;
    status: 'Planning' | 'Completed';
    memberIds: string[];
};

const LOCATION_UPDATE_INTERVAL_ACTIVE_TRIP = 3600000; // 1 hour for active trip

export default function LocationTracker() {
    const { user, loading, planningTrips } = useAuth();
    const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const isMounted = useRef(false);

    // Effect to find the currently active trip from the planningTrips provided by useAuth
    useEffect(() => {
        if (loading || !user) {
            setActiveTrip(null);
            return;
        }

        const now = new Date();
        const ongoingTrip = planningTrips.find(trip => trip.startDate.toDate() <= now);
        
        setActiveTrip(ongoingTrip || null);

    }, [user, loading, planningTrips]);

    // Effect to set up the location update interval based on whether a trip is active
    useEffect(() => {
        if (loading || !user?.uid || !isMounted.current) {
            if (!loading && user?.uid) {
                isMounted.current = true;
            }
            return;
        };
        
        const updateLocation = () => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    const locationArray: [number, number] = [latitude, longitude];
                    const hash = geohashForLocation(locationArray);
                    
                    const userDocRef = doc(db, 'users', user.uid);

                    try {
                        // Update the main user document with their latest location and geohash.
                        // This is crucial for the "Nearby SOS" feature.
                        await setDoc(userDocRef, {
                            lastLocation: {
                                lat: latitude,
                                lng: longitude,
                                geohash: hash,
                                updatedAt: Timestamp.now()
                            }
                        }, { merge: true });

                        // If there's an active trip, update the member list in the trip document as well.
                        if (activeTrip) {
                             const tripDocRef = doc(db, 'trips', activeTrip.id);
                             const tripDocSnap = await getDoc(tripDocRef);
                             if (tripDocSnap.exists()) {
                                const currentTripData = tripDocSnap.data();
                                if (currentTripData) {
                                    const updatedMembers = currentTripData.members.map((member: Member) => {
                                        if (member.digiId === user.digiId) {
                                            return { ...member, lat: latitude, lng: longitude };
                                        }
                                        return member;
                                    });
                                    await updateDoc(tripDocRef, { members: updatedMembers });
                                }
                             }
                        }
                       
                        console.log("LocationTracker: Successfully updated location.");

                    } catch (error) {
                        console.error("LocationTracker: Failed to update location:", error);
                    }
                },
                (error) => {
                    console.error(`LocationTracker: Geolocation error (Code: ${error.code}): ${error.message}`);
                },
                { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
            );
        };
        
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        // Only set up intervals if there's an active trip.
        if (activeTrip) {
            console.log(`LocationTracker: Active trip found. Starting hourly updates.`);
            // Update location once immediately, then start the hourly interval.
            updateLocation(); 
            intervalRef.current = setInterval(updateLocation, LOCATION_UPDATE_INTERVAL_ACTIVE_TRIP);
        } else {
             // If not on an active trip, just update the location once and stop.
             // This provides a recent location for the community alert feature without constant tracking.
             console.log("LocationTracker: No active trip. Performing a single location update.");
             updateLocation();
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [activeTrip, user?.uid, user?.digiId, loading]);

    // This component does not render anything
    return null;
}
