
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SOSButton } from "@/components/dashboard/quick-actions/sos-button";
import { useLanguage } from "@/hooks/use-language";

export function SOSCenter() {
    const { t } = useLanguage();

    return (
        <Card>
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{t('in_case_of_emergency_text')}</CardTitle>
                <CardDescription>
                   {t('sos_button_desc')}
                   <br />
                   {t('sos_button_confirmation_desc')}
                </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center py-6">
                <SOSButton />
            </CardContent>
        </Card>
    );
}
