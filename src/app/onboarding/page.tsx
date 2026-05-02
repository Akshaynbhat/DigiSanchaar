
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { addTransaction } from "@/lib/blockchain";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Shield } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";


export default function OnboardingPage() {
    const router = useRouter();
    const { reloadUser } = useAuth();
    const { toast } = useToast();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string|null>(null);
    
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    

    const handleEmailSignUp = async () => {
        setLoading(true);
        setError(null);
        if (!name || !email || !password) {
            setError("Please fill all fields.");
            setLoading(false);
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const newDigiId = `DIGI-${user.uid.slice(0, 4).toUpperCase()}${Date.now().toString().slice(-4)}`;
            const userDocRef = doc(db, 'users', user.uid);

            // Set onboardingComplete to false to force profile setup
            await setDoc(userDocRef, {
                uid: user.uid,
                name,
                email: user.email,
                photoURL: user.photoURL || `https://picsum.photos/seed/${user.uid}/150/150`,
                digiId: newDigiId,
                onboardingComplete: false, 
            }, { merge: true });

            try {
                await addTransaction({
                    type: 'CREATE_USER',
                    userId: user.uid,
                    name: name,
                    digiId: newDigiId
                });
            } catch (blockchainError) {
                console.warn("Failed to write to blockchain, but user creation succeeded:", blockchainError);
            }
            
            await reloadUser();
            toast({ title: "Account Created!", description: "Please complete your profile setup."});
            router.push('/profile'); // Redirect to profile page for setup

        } catch (error) {
            const firebaseError = error as { code?: string; message: string };
            console.error(`Sign up error:`, firebaseError);
            
            switch (firebaseError.code) {
                case 'auth/email-already-in-use':
                    setError("This email is already in use. Please sign in instead.");
                    break;
                case 'auth/weak-password':
                    setError("The password is too weak. Please use at least 6 characters.");
                    break;
                case 'auth/invalid-email':
                    setError("Please enter a valid email address.");
                    break;
                default:
                    setError(firebaseError.message);
                    break;
            }
        } finally {
            setLoading(false);
        }
    };


    return (
         <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
             <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold font-headline">Create Account</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to DigiSanchaar</CardTitle>
                        <CardDescription>Enter your details to get started.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" type="text" placeholder="e.g., Jane Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password (min. 6 characters)</Label>
                            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                        <Button onClick={handleEmailSignUp} disabled={loading} className="w-full">
                            {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
                        </Button>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                          Already have an account?{' '}
                          <Link
                            href="/login"
                            className="underline underline-offset-4 hover:text-primary"
                          >
                            Sign In
                          </Link>
                          .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

// Add recaptchaVerifier to window for global access
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}
