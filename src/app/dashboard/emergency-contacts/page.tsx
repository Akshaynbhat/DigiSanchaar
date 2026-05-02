
"use client";

import { EmergencyContactForm } from "@/components/settings/emergency-contact-form";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2, User } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export default function EmergencyContactsPage() {
    const { t } = useLanguage();
    const { user, loading } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="flex h-40 w-full flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">{t('loading_settings_text')}</p>
            </div>
        );
    }
    
    if (!user) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-full">
                <User className="h-12 w-12 text-muted-foreground" />
                <h1 className="mt-4 text-3xl font-headline font-bold">{t('please_log_in_title')}</h1>
                <p className="mt-2 text-muted-foreground">You must be logged in to manage your settings.</p>
                <Link href="/login" className="mt-4">
                    <Button>Sign In</Button>
                </Link>
            </div>
          );
    }

     if (!user.onboardingComplete) {
         return (
            <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed rounded-lg h-full">
                <User className="h-12 w-12 text-muted-foreground" />
                <h1 className="mt-4 text-3xl font-headline font-bold">{t('complete_onboarding_title')}</h1>
                <p className="mt-2 text-muted-foreground">{t('complete_onboarding_to_access_settings_desc')}</p>
                <Link href="/profile" className="mt-4">
                    <Button>{t('go_to_onboarding_button')}</Button>
                </Link>
            </div>
          );
    }


    return (
        <div className="max-w-4xl mx-auto space-y-8">
             <header>
                <h1 className="text-3xl font-headline font-bold">{t('emergency_contacts_title')}</h1>
                <p className="text-muted-foreground">{t('emergency_contacts_desc')}</p>
            </header>
            
            <EmergencyContactForm />

        </div>
    );
}
