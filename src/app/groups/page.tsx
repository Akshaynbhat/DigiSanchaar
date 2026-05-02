
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Trash2, FilePlus, Copy, CheckCircle, Loader2, Pencil } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, arrayUnion, query, where, Timestamp } from "firebase/firestore";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";
import { addTransaction } from "@/lib/blockchain";
import { Label } from "@/components/ui/label";

type Member = {
  name: string;
  avatar: string;
  digiId: string;
};

type Trip = {
  id: string; // Firestore document ID
  tripId: string; // The human-readable Trip ID
  name: string;
  members: Member[];
  status: "Planning" | "Completed";
  statusVariant: "default" | "destructive" | "secondary";
  startDate: Timestamp;
  memberIds: string[];
  createdBy: string; // UID of the user who created the trip
};

export default function GroupsPage() {
  const { user, loading: authLoading, planningTrips } = useAuth();
  const [newTripName, setNewTripName] = useState("");
  const [memberDigiId, setMemberDigiId] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const { t } = useLanguage();

  const createTrip = async () => {
    if (!user) {
        toast({ variant: 'destructive', title: t('must_be_logged_in_to_create_trip_desc') });
        return;
    }
    if (!newTripName.trim()) {
      toast({
        variant: "destructive",
        title: t('trip_name_empty_error_title'),
      });
      return;
    }
    
    try {
      // The current user automatically becomes the first member.
      const currentUserMember: Member = {
        name: user.displayName || t('you_text'),
        avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/150/150`,
        digiId: user.digiId || user.uid,
      };

      const tripId = `TRIP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const newTripData = {
        tripId: tripId,
        name: newTripName,
        members: [currentUserMember],
        memberIds: [user.uid], // Use Firebase UID for querying
        status: "Planning",
        statusVariant: "default",
        startDate: Timestamp.now(), // Set start date to now
        createdBy: user.uid, // Set the creator of the trip
      };
      
      await addDoc(collection(db, "trips"), newTripData);

      try {
        await addTransaction({
            type: 'CREATE_TRIP',
            tripId: tripId,
            tripName: newTripName,
            createdBy: user.uid,
        });
      } catch (blockchainError) {
          console.warn("Blockchain transaction failed, but trip creation succeeded:", blockchainError);
      }


      setNewTripName("");
      toast({
        title: t('trip_created_title'),
        description: t('trip_created_success_desc', { tripName: newTripName }),
      });
    } catch (error) {
      console.error("Failed to create trip", error);
      toast({
        variant: "destructive",
        title: t('error_title'),
        description: t('could_not_create_trip_desc'),
      });
    }
  };

  const addMember = async (tripIdFirestore: string, tripIdReadable: string) => {
    const digiIdToAdd = memberDigiId[tripIdFirestore];
    if (!digiIdToAdd || !digiIdToAdd.trim()) {
      toast({
        variant: "destructive",
        title: t('invalid_digi_id_title'),
        description: t('enter_valid_digi_id_desc'),
      });
      return;
    }

    try {
      // Find the user with the given Digi-ID
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("digiId", "==", digiIdToAdd), where("onboardingComplete", "==", true));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          toast({ variant: "destructive", title: "User not found", description: "No user found with that Digi-ID."});
          return;
      }

      const userDoc = querySnapshot.docs[0];
      const userToAdd = userDoc.data();
      const userUid = userDoc.id;
      
      const tripDocRef = doc(db, 'trips', tripIdFirestore);
      const newMember: Member = {
          name: userToAdd.name || digiIdToAdd.slice(0, 6),
          avatar: userToAdd.photoURL || `https://picsum.photos/seed/${userUid}/150/150`,
          digiId: digiIdToAdd,
      };
      
      // Update the trip with the new member and their UID for queries.
      await updateDoc(tripDocRef, {
        members: arrayUnion(newMember),
        memberIds: arrayUnion(userUid),
      });

      try {
        await addTransaction({
            type: 'ADD_MEMBER',
            tripId: tripIdReadable,
            memberAdded: userUid,
            memberDigiId: digiIdToAdd,
            addedBy: user?.uid,
        });
      } catch (blockchainError) {
          console.warn("Blockchain transaction failed, but adding member succeeded:", blockchainError);
      }

      setMemberDigiId(prev => ({...prev, [tripIdFirestore]: ''}));
      toast({
          title: t('member_added_title'),
          description: t('new_member_added_to_trip_desc')
      });
    } catch (error) {
        console.error("Failed to add member:", error);
        toast({
            variant: "destructive",
            title: t('error_title'),
            description: t('could_not_add_member_desc'),
        });
    }
  };

  const deleteTrip = async (tripId: string) => {
    try {
        await deleteDoc(doc(db, 'trips', tripId));
        toast({
            title: t('trip_deleted_title'),
            description: t('trip_removed_from_plans_desc')
        });
    } catch (error) {
        console.error("Error deleting trip:", error);
        toast({
            variant: "destructive",
            title: t('error_title'),
            description: t('could_not_delete_trip_desc'),
        });
    }
  }

  const endTrip = async (tripId: string, tripIdReadable: string) => {
    try {
        const tripDocRef = doc(db, 'trips', tripId);
        await updateDoc(tripDocRef, {
            status: "Completed",
            statusVariant: "secondary"
        });
        
        try {
            await addTransaction({
                type: 'END_TRIP',
                tripId: tripIdReadable,
                endedBy: user?.uid,
            });
        } catch (blockchainError) {
            console.warn("Blockchain transaction failed, but ending trip succeeded:", blockchainError);
        }

        toast({
            title: t('trip_completed_title'),
            description: t('trip_moved_to_past_trips_desc'),
        });
    } catch(error) {
        console.error("Error ending trip:", error);
        toast({
            variant: "destructive",
            title: t('error_title'),
            description: t('could_not_end_trip_desc'),
        });
    }
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
        title: t('copied_to_clipboard_title'),
    });
  }

  const renderContent = () => {
    // Show a loader while auth state is resolving or trips are being fetched.
    if (authLoading) {
      return (
          <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
      );
    }
    
    // After loading, if there's no user, show a prompt to log in.
    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg">
                <Users className="h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold">{t('please_log_in_title')}</h2>
                <p className="mt-1 text-muted-foreground">{t('must_be_logged_in_to_manage_trips_desc')}</p>
                 <Link href="/login" className="mt-4">
                    <Button>Sign In</Button>
                </Link>
            </div>
        );
    }

    if (planningTrips.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg bg-muted/50">
            <FilePlus className="h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-2xl font-semibold font-headline">{t('no_active_trips_title')}</h2>
            <p className="mt-2 text-muted-foreground">{t('no_active_trips_desc')}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {planningTrips.map((trip) => (
          <Card key={trip.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="font-headline text-xl">{trip.name}</CardTitle>
                  <p className="text-sm text-muted-foreground pt-1">
                      {t('starts_on_text')}: {new Date(trip.startDate.seconds * 1000).toLocaleDateString(undefined, { dateStyle: 'long' })}
                  </p>
                </div>
                <Badge variant={"default"}>{t('planning')}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <p className="text-muted-foreground">Trip ID:</p>
                  <span className="font-mono bg-muted px-2 py-1 rounded text-xs">
                      {trip.tripId}
                  </span>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(trip.tripId)}>
                      <Copy className="h-3 w-3" />
                  </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div className="flex -space-x-2 overflow-hidden">
                  {trip.members.map((member, index) => (
                    <Avatar key={`${member.digiId}-${index}`} className="inline-block border-2 border-background h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {t('members_count', { count: trip.members.length })}
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor={`add-member-${trip.id}`} className="text-sm font-medium">{t('add_members_with_digi_id_label')}</Label>
                <div className="flex gap-2">
                  <Input 
                      id={`add-member-${trip.id}`}
                      placeholder={t('enter_digi_id_placeholder')} 
                      className="flex-grow"
                      value={memberDigiId[trip.id] || ''}
                      onChange={(e) => setMemberDigiId({...memberDigiId, [trip.id]: e.target.value})}
                  />
                  <Button variant="secondary" onClick={() => addMember(trip.id, trip.tripId)}>{t('add_button')}</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="mt-auto bg-muted/50 p-4 flex flex-col items-start gap-4">
               <div className="flex flex-wrap justify-start gap-2 w-full">
                  <Link href={`/trip/${trip.id}`} passHref>
                    <Button>
                      <Pencil className="mr-2 h-4 w-4" />
                      {t('do_your_planning_button')}
                    </Button>
                  </Link>
                  {user?.uid === trip.createdBy && (
                    <div className="flex-grow flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => endTrip(trip.id, trip.tripId)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t('end_trip_button')}
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon" className="h-9 w-9">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('are_you_sure_title')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('delete_trip_warning_desc')}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('cancel_button')}</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteTrip(trip.id)} className="bg-destructive hover:bg-destructive/90">{t('delete_button')}</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
               </div>
               <p className="text-xs text-muted-foreground pt-2">{t('trip_id_security_desc')}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-headline font-bold">{t('your_trips_title')}</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!user}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {t('create_trip_button')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">{t('create_new_trip_title')}</DialogTitle>
              <DialogDescription>
                {t('create_new_trip_desc')}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="name"
                placeholder={t('trip_name_placeholder')}
                value={newTripName}
                onChange={(e) => setNewTripName(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="submit" onClick={createTrip}>{t('create_trip_button')}</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="min-h-[400px]">
        {renderContent()}
      </div>
    </div>
  );
}
