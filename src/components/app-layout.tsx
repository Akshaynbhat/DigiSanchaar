
"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  Settings,
  Shield,
  Menu,
  User,
  LogOut,
  Contact,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "./ui/button";
import LocationTracker from "./location-tracker";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import LanguageSwitcher from "./language-switcher";
import { useLanguage } from "@/hooks/use-language";
import { useAuth } from "@/context/auth-context";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  
  const handleSignOut = async () => {
    await logout();
    router.push('/login');
  };

  const menuItems = [
    { href: "/dashboard", label: t('nav_dashboard'), icon: Home },
    { href: "/groups", label: t('nav_your_trips'), icon: Users },
    { href: "/dashboard/emergency-contacts", label: t('nav_emergency_contacts'), icon: Contact },
    { href: "/settings", label: t('nav_settings'), icon: Settings },
  ];

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Shield className="text-primary size-8" />
            <h1 className="text-2xl font-headline font-bold text-primary">
              DigiSanchaar
            </h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href) && item.href !== '/dashboard' ? true : pathname === '/dashboard'}
                  tooltip={{ children: item.label }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="space-y-2">
           <Button variant="ghost" className="w-full justify-start gap-2 px-2" asChild>
             <Link href="/profile">
              <Avatar className="h-8 w-8">
                 <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || 'User'} />
                 <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start text-left overflow-hidden">
                <span className="text-sm font-medium text-sidebar-foreground truncate">{user?.displayName || t('user')}</span>
              </div>
             </Link>
           </Button>
           <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start gap-2 px-2 text-red-400 hover:bg-red-900/50 hover:text-red-300">
             <LogOut />
             <span>{t('sign_out')}</span>
           </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-card px-4 lg:px-6 sticky top-0 z-30">
          <div className="lg:hidden">
            <SidebarTrigger>
              <Menu />
            </SidebarTrigger>
          </div>
          <div className="flex-1" />
           <div className="flex items-center gap-4">
             <p className="text-sm font-medium">
               {t('welcome')}, {user?.displayName || t('user')}
             </p>
             <LanguageSwitcher />
           </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <LocationTracker />
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
