
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { doc, onSnapshot, collection, query, where, Timestamp, getDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Define the shape of your user data from Firestore
interface FirestoreUser extends DocumentData {
  onboardingComplete?: boolean;
  digiId?: string;
  name?: string;
  email?: string;
  photoURL?: string;
  phone?: string;
  phoneNumber?: string;
  emergencyContacts?: any[];
  distressPattern?: number[];
}

type Trip = {
  id: string;
  name: string;
  members: { name: string; avatar: string; digiId: string; }[];
  status: "Planning" | "Completed";
  itinerary?: { name: string; places: string[] }[];
  safetyScore?: number;
  startDate: Timestamp;
  memberIds: string[];
  createdBy: string;
};

// Combine Firebase Auth User with your Firestore data
export type AppUser = User & FirestoreUser;

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  planningTrips: Trip[];
  completedTrips: Trip[];
  logout: () => Promise<void>;
  reloadUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [planningTrips, setPlanningTrips] = useState<Trip[]>([]);
  const [completedTrips, setCompletedTrips] = useState<Trip[]>([]);

  // Function to fetch Firestore user data and merge with auth user
  const fetchAndSetUser = useCallback(async (authUser: User | null) => {
    if (authUser) {
      const userDocRef = doc(db, 'users', authUser.uid);
      const unsub = onSnapshot(userDocRef, (docSnap) => {
        const firestoreData = docSnap.exists() ? docSnap.data() as FirestoreUser : {};
        
        // Explicitly merge displayName and photoURL from authUser
        // as they are the source of truth after profile updates.
        const mergedUser: AppUser = {
            ...authUser,
            ...firestoreData,
            displayName: authUser.displayName || firestoreData.name || null,
            photoURL: authUser.photoURL || firestoreData.photoURL || null,
        };

        setUser(mergedUser);
        setLoading(false);
      }, (error) => {
        console.error("Error in user snapshot listener:", error);
        setUser(authUser as AppUser); // Fallback to auth user data on error
        setLoading(false);
      });
      return unsub;
    } else {
      setUser(null);
      setLoading(false);
      return () => {};
    }
  }, []);

  // Main auth state listener
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
        fetchAndSetUser(authUser);
    });
    return () => unsubscribeAuth();
  }, [fetchAndSetUser]);

  // Trip data listener
  useEffect(() => {
      if (!user?.uid) {
          setPlanningTrips([]);
          setCompletedTrips([]);
          return;
      };

      const tripsCollection = collection(db, 'trips');
      
      const planningQuery = query(
          tripsCollection, 
          where("status", "==", "Planning"),
          where("memberIds", "array-contains", user.uid)
      );
      const unsubscribePlanning = onSnapshot(planningQuery, (snapshot) => {
          const tripsData: Trip[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
          setPlanningTrips(tripsData);
      }, console.error);

      const completedQuery = query(
          tripsCollection, 
          where("status", "==", "Completed"),
          where("memberIds", "array-contains", user.uid)
      );
      const unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
          const tripsData: Trip[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
          tripsData.sort((a, b) => b.startDate.seconds - a.startDate.seconds);
          setCompletedTrips(tripsData);
      }, console.error);

      return () => {
          unsubscribePlanning();
          unsubscribeCompleted();
      };
  }, [user?.uid]);

  const logout = async () => {
    setLoading(true);
    await signOut(auth);
    setUser(null); // Clear user immediately
    setLoading(false);
  };
  
  const reloadUser = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setLoading(true);
      await currentUser.reload();
      // Refetch the merged user data
      await fetchAndSetUser(auth.currentUser);
      setLoading(false);
    }
  }, [fetchAndSetUser]);


  const value = { user, loading, planningTrips, completedTrips, logout, reloadUser };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
