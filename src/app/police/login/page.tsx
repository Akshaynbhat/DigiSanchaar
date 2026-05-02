
"use client";

import { useRouter } from "next/navigation";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function PoliceLoginPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
         <div className="flex justify-center mb-6">
             <div className="flex items-center gap-3">
                <Shield className="size-12 text-blue-600" />
                <div>
                    <h1 className="text-3xl font-headline font-bold text-gray-800 dark:text-gray-200">
                        Police Dashboard
                    </h1>
                    <p className="text-muted-foreground">DigiSanchaar</p>
                </div>
            </div>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="font-headline text-2xl">Access Dashboard</CardTitle>
            <CardDescription>The login form is temporarily disabled. Use the button below to go directly to the dashboard.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/police/dashboard/efir" passHref>
                <Button className="w-full">
                    Go to E-FIR Dashboard
                </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
