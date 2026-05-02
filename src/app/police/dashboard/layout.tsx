
"use client";

import { PoliceSidebar } from "@/components/police/police-sidebar";

export default function PoliceDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">
            <PoliceSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-gray-100/50 dark:bg-background">
                {children}
            </main>
        </div>
    );
}
