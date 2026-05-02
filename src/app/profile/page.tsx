
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, User, Mail, Smartphone, Copy, UploadCloud, ArrowRight, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { auth, db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateProfile, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider } from "firebase/auth";
import { useDropzone } from 'react-dropzone';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

export default function ProfilePage() {
    const { user, loading, reloadUser } = useAuth();
    const { t } = useLanguage();
    const { toast } = useToast();
    const router = useRouter();

    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [hasSaved, setHasSaved] = useState(false);

    // State for phone number update
    const [isPhoneDialogOpen, setIsPhoneDialogOpen] = useState(false);
    const [isUpdatingPhone, setIsUpdatingPhone] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState<any>(null);
    const [otpSent, setOtpSent] = useState(false);


    useEffect(() => {
        if (user) {
            setName(user.displayName || user.name || "");
            if (user.onboardingComplete) {
                setHasSaved(true);
            }
        }
    }, [user]);

    // Effect to setup reCAPTCHA verifier only once, after the component has mounted.
    useEffect(() => {
        // This function will run after the component mounts.
        // The return function will run when the component unmounts.
        const setupRecaptcha = () => {
             if (!window.recaptchaVerifier) {
                // Ensure the container exists before initializing
                const recaptchaContainer = document.getElementById('recaptcha-container');
                if (recaptchaContainer) {
                    window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
                        'size': 'invisible',
                        'callback': (response: any) => {
                            console.log("reCAPTCHA solved");
                        },
                        'expired-callback': () => {
                            // This part is for re-rendering/resetting the widget if it expires.
                            // The implementation might vary based on how you handle re-verification.
                            if (window.recaptchaVerifier) {
                                try {
                                    window.recaptchaVerifier.render().then((widgetId: any) => {
                                        if (window.grecaptcha) window.grecaptcha.reset(widgetId);
                                    });
                                } catch (e) {
                                    console.error("Error resetting captcha", e)
                                }
                            }
                        }
                    });
                     // Render the verifier
                    window.recaptchaVerifier.render();
                }
            }
        };
        
        setupRecaptcha();

    }, []);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles) => handleImageUpload(acceptedFiles[0]),
        accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
        multiple: false,
    });

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({
            title: t('copied_to_clipboard_title'),
            description: t('digi_id_copied_desc'),
        });
    };

    const handleProfileUpdate = async () => {
        if (!user || !name.trim()) {
            toast({ variant: 'destructive', title: "Validation Error", description: "Name cannot be empty." });
            return;
        }

        setIsSaving(true);
        try {
            const userDocRef = doc(db, 'users', user.uid);
            
            await updateDoc(userDocRef, {
                name: name,
                onboardingComplete: true,
            });

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { displayName: name });
            }

            toast({ title: "Profile Saved", description: "Your details have been updated." });
            setHasSaved(true);
            await reloadUser();

        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ variant: 'destructive', title: "Update Failed", description: "Could not save your profile." });
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleImageUpload = async (file: File) => {
        if (!user || !file) return;
        
        setIsUploading(true);
        try {
            const storageRef = ref(storage, `profile-pics/${user.uid}/${file.name}`);
            const snapshot = await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(snapshot.ref);

            if (auth.currentUser) {
                await updateProfile(auth.currentUser, { photoURL: downloadURL });
            }
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL: downloadURL });

            await reloadUser();
            toast({ title: "Profile Picture Updated" });

        } catch (error) {
             console.error("Error uploading image:", error);
             toast({ variant: "destructive", title: "Upload Failed", description: "Could not update your profile picture." });
        } finally {
            setIsUploading(false);
        }
    };

    const handleSendOtp = async () => {
        if (newPhone.length !== 10) {
            toast({ variant: 'destructive', title: t('invalid_phone_number_title'), description: t('enter_10_digit_phone_desc') });
            return;
        }
        
        setIsUpdatingPhone(true);
        try {
            const appVerifier = window.recaptchaVerifier;
            const phoneNumber = `+91${newPhone}`;
            
            const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
            
            setConfirmationResult(result);
            setOtpSent(true);
            toast({ title: t('otp_sent_title'), description: t('check_phone_for_code_desc') });
        } catch (error) {
            console.error("Failed to send OTP", error);
            toast({ variant: 'destructive', title: t('failed_to_send_otp_title'), description: "Please try again later. Ensure the reCAPTCHA is working." });
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.render().then((widgetId: any) => {
                        if(window.grecaptcha) window.grecaptcha.reset(widgetId);
                    });
                } catch (e) {
                     console.error("Error resetting captcha", e)
                }
            }
        } finally {
            setIsUpdatingPhone(false);
        }
    };

    const handleVerifyOtpAndUpdatePhone = async () => {
        if (!confirmationResult || !user) return;
        setIsUpdatingPhone(true);
        try {
            const phoneCredential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
            
            // This is a simplified approach. A production app would need a more robust
            // re-authentication flow if the user hasn't signed in recently.
            
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                phoneNumber: newPhone,
                phone: newPhone
            });
            
            await reloadUser();
            toast({ title: t('phone_updated_title'), description: t('phone_changed_successfully_desc') });
            
            // Reset state and close dialog
            setOtpSent(false);
            setNewPhone('');
            setOtp('');
            setIsPhoneDialogOpen(false);

        } catch (error) {
            console.error("Error verifying OTP or updating phone:", error);
            toast({ variant: 'destructive', title: t('invalid_otp_title') });
        } finally {
            setIsUpdatingPhone(false);
        }
    };


    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                 <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <h1 className="mt-4 text-xl font-semibold">{t('loading_profile_title')}</h1>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-auto">
                    <User className="h-12 w-12 text-muted-foreground" />
                    <h1 className="mt-4 text-3xl font-headline font-bold">{t('please_log_in_title')}</h1>
                    <p className="mt-2 text-muted-foreground">{t('must_be_logged_in_to_view_profile_desc')}</p>
                    <Link href="/login" className="mt-4">
                        <Button>Sign In</Button>
                    </Link>
                </div>
            </div>
        );
    }
    
    const DetailItem = ({ icon, label, value, children }: { icon: React.ReactNode, label: string, value?: string | null, children?: React.ReactNode }) => (
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <div className="text-muted-foreground">{icon}</div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="font-medium">{value || t('not_set_text')}</p>
                </div>
            </div>
            {children}
        </div>
    );

    return (
       <div className="flex items-center justify-center min-h-screen bg-muted/40 p-4">
            <div id="recaptcha-container"></div>
            <div className="max-w-2xl w-full space-y-8">
                {!user.onboardingComplete && (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/50 border border-yellow-300 dark:border-yellow-700 rounded-lg text-center">
                        <p className="font-semibold text-yellow-800 dark:text-yellow-200">Please complete your profile to access all app features.</p>
                    </div>
                )}

                <div className="flex items-center gap-6">
                    <div {...getRootProps()} className="relative cursor-pointer group">
                        <input {...getInputProps()} />
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'}/>
                            <AvatarFallback>{user.displayName?.charAt(0) || name.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                         <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           {isUploading ? <Loader2 className="text-white animate-spin" /> : <UploadCloud className="text-white h-8 w-8"/>}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-3xl font-headline font-bold">{user.displayName || name || 'User'}</h1>
                        <p className="text-muted-foreground">{t('your_profile_desc')}</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">{t('account_details_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('name_label')}</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <DetailItem icon={<Mail />} label={t('email_label')} value={user.email} />
                        <DetailItem icon={<Smartphone />} label={t('phone_number_label')} value={user.phone || user.phoneNumber}>
                             <Dialog open={isPhoneDialogOpen} onOpenChange={setIsPhoneDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">{t('change_button')}</Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{t('update_phone_number_title')}</DialogTitle>
                                        <DialogDescription>
                                            {t('verification_code_sent_desc')}
                                        </DialogDescription>
                                    </DialogHeader>
                                    {!otpSent ? (
                                        <div className="space-y-4">
                                            <Input
                                                placeholder={t('new_10_digit_number_placeholder')}
                                                value={newPhone}
                                                onChange={(e) => setNewPhone(e.target.value)}
                                            />
                                            <Button onClick={handleSendOtp} disabled={isUpdatingPhone} className="w-full">
                                                {isUpdatingPhone ? <Loader2 className="animate-spin" /> : t('send_otp_button')}
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <Input
                                                placeholder={t('enter_6_digit_code_desc', {phone: newPhone})}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                             <div className="flex gap-2">
                                                <Button variant="outline" onClick={() => setOtpSent(false)}>{t('back_button')}</Button>
                                                <Button onClick={handleVerifyOtpAndUpdatePhone} disabled={isUpdatingPhone} className="flex-1">
                                                    {isUpdatingPhone ? <Loader2 className="animate-spin" /> : t('verify_and_save_button')}
                                                </Button>
                                             </div>
                                        </div>
                                    )}
                                </DialogContent>
                            </Dialog>
                        </DetailItem>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-4">
                         <p className="font-headline text-lg">{t('your_digi_id_label')}</p>
                        <div className="p-3 bg-muted rounded-md flex items-center justify-between w-full">
                            <span className="font-mono text-base font-bold">{user.digiId}</span>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => user.digiId && copyToClipboard(user.digiId)}
                                disabled={!user.digiId}
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>

                <div className="flex justify-end gap-2">
                    { !hasSaved ? (
                         <Button onClick={handleProfileUpdate} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                            Save Profile
                        </Button>
                    ) : (
                         user.onboardingComplete ? (
                            <Link href="/dashboard" passHref>
                                <Button>Go to Dashboard</Button>
                            </Link>
                         ) : (
                            <Button onClick={handleProfileUpdate} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 animate-spin"/>}
                                Save and Continue
                                <ArrowRight className="ml-2"/>
                            </Button>
                         )
                    )}
                </div>
            </div>
       </div>
    );
}

// Add recaptchaVerifier to window for global access
declare global {
  interface Window {
    recaptchaVerifier: any;
    grecaptcha: any;
  }
}
