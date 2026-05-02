
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutDashboard, FileText, Users, LogOut, Settings } from "lucide-react";
import { Button } from "../ui/button";

const menuItems = [
    { href: "/police/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/police/dashboard/efir", label: "E-FIR Logs", icon: FileText },
    { href: "/police/dashboard/records", label: "Digital ID Records", icon: Users },
    { href: "/police/dashboard/settings", label: "Settings", icon: Settings },
];

export function PoliceSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleSignOut = () => {
        // In a real app, you would clear the session/cookie
        router.push('/police/login');
    }

    return (
        <aside className="w-64 bg-gray-800 text-white flex-col p-4 sticky top-0 h-screen hidden lg:flex">
            <div className="flex items-center gap-3 mb-8">
                <Shield className="size-10 text-blue-400" />
                <h1 className="text-xl font-headline font-bold">Police Control</h1>
            </div>
            <nav className="flex-1">
                <ul className="space-y-2">
                    {menuItems.map((item) => (
                        <li key={item.href}>
                            <Link href={item.href}>
                                <div className={`flex items-center gap-3 p-2 rounded-md transition-colors ${
                                    pathname.startsWith(item.href)
                                        ? "bg-blue-600 text-white"
                                        : "hover:bg-gray-700"
                                }`}>
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div>
                 <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start gap-3 text-red-400 hover:bg-red-900/50 hover:text-red-300">
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                 </Button>
            </div>
        </aside>
    );
}
