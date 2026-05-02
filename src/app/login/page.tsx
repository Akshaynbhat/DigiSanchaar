
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Shield } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();
    const { toast } = useToast();

    const handleEmailSignIn = async () => {
        setIsLoading(true);
        setError(null);

        const finalEmail = email.trim();

        if (!finalEmail || !password) {
            setError("Please enter both email and password.");
            setIsLoading(false);
            return;
        }

        try {
            await signInWithEmailAndPassword(auth, finalEmail, password);
            toast({ title: "Login Successful" });
             router.push('/dashboard');
        } catch(error) {
            const firebaseError = error as { code?: string; message: string };
            console.error(`Sign in error:`, firebaseError);
            
            switch (firebaseError.code) {
                case 'auth/user-not-found':
                case 'auth/wrong-password':
                case 'auth/invalid-credential':
                    setError("Invalid credentials. Please check your email and password or sign up.");
                    break;
                case 'auth/invalid-email':
                    setError("Please enter a valid email address.");
                    break;
                 case 'auth/internal-error':
                    setError("An internal authentication error occurred. Please check your project's configuration in the Firebase Console.");
                    break;
                default:
                    setError(firebaseError.message);
                    break;
            }
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
             <div className="w-full max-w-md space-y-4">
                <div className="flex items-center justify-center gap-2">
                    <Shield className="h-10 w-10 text-primary" />
                    <h1 className="text-3xl font-bold font-headline">DigiSanchaar</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome</CardTitle>
                        <CardDescription>Sign in to your account to continue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="signin-email">Email Address</Label>
                                <Input id="signin-email" type="email" placeholder="name@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="signin-password">Password</Label>
                                <Input id="signin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                            <Button onClick={handleEmailSignIn} disabled={isLoading} className="w-full">
                                {isLoading ? <Loader2 className="animate-spin" /> : "Sign In"}
                            </Button>
                        </div>
                        <p className="px-8 text-center text-sm text-muted-foreground">
                          New to DigiSanchaar?{' '}
                          <Link
                            href="/onboarding"
                            className="underline underline-offset-4 hover:text-primary"
                          >
                            Create an account
                          </Link>
                          .
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
