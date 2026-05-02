
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "../ui/button";
import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

interface OnboardingContainerProps {
  title: string;
  description: string;
  progress: number; // A value between 0 and 100
  children: React.ReactNode;
}

export function OnboardingContainer({ title, description, progress, children }: OnboardingContainerProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await logout();
    router.replace('/login');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="mb-4">
             <Progress value={progress} className="h-2" />
          </div>
          <CardTitle className="font-headline text-3xl">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
        <CardFooter className="flex-col items-center border-t pt-4 mt-4">
           <p className="text-xs text-muted-foreground mb-2">Stuck? You can sign out and start over.</p>
           <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-muted-foreground hover:text-destructive">
             <LogOut className="mr-2 h-4 w-4" />
             Sign Out and Restart
           </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
