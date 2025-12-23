
import type { ReactNode } from "react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { DashboardHeader } from "@/components/dashboard/header";
import { SidebarNav } from "@/components/dashboard/sidebar-nav";
import { SearchProvider } from "@/hooks/use-search";
import { InactivityProvider } from "@/components/auth/inactivity-provider";
import { RequireAuth } from "@/components/auth/requireAuth";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <SearchProvider>
        <SidebarProvider>
          <InactivityProvider>
            <Sidebar>
              <SidebarNav />
            </Sidebar>
            <SidebarInset>
              <DashboardHeader />
              <main className="p-4 sm:p-6">{children}</main>
            </SidebarInset>
          </InactivityProvider>
        </SidebarProvider>
      </SearchProvider>
    </RequireAuth>
  );
}
