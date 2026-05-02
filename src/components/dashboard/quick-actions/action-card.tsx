
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string;
    icon: LucideIcon;
    className?: string;
}

export const ActionCard = ({ title, icon: Icon, className, ...props }: ActionCardProps) => {
    return (
        <div className={cn("hover:bg-card/90 hover:shadow-md transition-all h-full cursor-pointer rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col", className)} {...props}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-6">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
        </div>
    );
};
