
"use client";

import { CircleUser, Search } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname, useRouter } from "next/navigation";
import { Badge } from "../ui/badge";
import { useAuth } from "@/firebase";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useSearch } from "@/hooks/use-search";
import { useToast } from "@/hooks/use-toast";

const getPageTitle = (pathname: string) => {
  if (pathname === "/overview") return "Dashboard";
  if (pathname.startsWith("/technician")) return "Technician";
  if (pathname.startsWith("/supervisor")) return "Supervisor";
  if (pathname.startsWith("/resolved")) return "Resolved Tickets";
  if (pathname.startsWith("/admin")) return "Administrator";
  return "Dashboard";
};

export function DashboardHeader() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const auth = useAuth();
  const router = useRouter();
  const { userProfile, isLoading } = useUserProfile();
  const { searchTerm, setSearchTerm } = useSearch();
  const { toast } = useToast();

  const handleLogout = () => {
    if (!auth) return;
    auth.signOut();
    router.push('/login');
  };
  
  const handleComingSoon = () => {
    toast({
      title: "Coming Soon!",
      description: "This feature is currently under development.",
    });
  };


  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 sm:h-16 sm:px-6">
      <SidebarTrigger />
      <div className="w-full flex-1">
        <h1 className="text-lg font-semibold md:text-2xl">{title}</h1>
      </div>
      <div className="relative flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search tickets..."
          className="w-full rounded-lg bg-muted pl-8 md:w-[200px] lg:w-[336px]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <CircleUser className="h-5 w-5" />
            <span className="sr-only">Toggle user menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {isLoading ? (
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-3 w-32 bg-muted rounded animate-pulse" />
              </div>
            </DropdownMenuLabel>
          ) : userProfile ? (
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile.email}
                </p>
                 <Badge variant="outline" className="mt-2 w-fit">{userProfile.role}</Badge>
              </div>
            </DropdownMenuLabel>
          ) : (
             <DropdownMenuLabel>Not logged in</DropdownMenuLabel>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleComingSoon}>Settings</DropdownMenuItem>
          <DropdownMenuItem onClick={handleComingSoon}>Support</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
