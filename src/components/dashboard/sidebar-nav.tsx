
'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Wrench, 
  Shield, 
  CheckCircle,
  Users,
  LayoutDashboard,
  Headset
} from "lucide-react";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import { useUserProfile } from "@/hooks/use-user-profile";
import { UserRole } from "@/lib/types";

const menuItems = {
  overview: { href: "/overview", label: "Overview", icon: LayoutDashboard },
  helpDesk: { href: "/help-desk", label: "Help Desk", icon: Headset },
  technician: { href: "/technician", label: "Technician", icon: Wrench },
  supervisor: { href: "/supervisor", label: "Supervisor", icon: Users },
  resolved: { href: "/resolved", label: "Resolved", icon: CheckCircle },
  admin: { href: "/admin", label: "Admin", icon: Shield },
};

export function SidebarNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { userProfile, isLoading } = useUserProfile();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  const getVisibleMenuItems = () => {
    if (!userProfile) {
      return { roleItems: [], otherItems: [] };
    }

    const { role } = userProfile;
    let roleItems = [];
    let otherItems = [];

    switch (role) {
      case UserRole.Admin:
        roleItems = [menuItems.helpDesk, menuItems.technician, menuItems.supervisor];
        otherItems = [menuItems.resolved, menuItems.admin];
        break;
      case UserRole.Supervisor:
        roleItems = [menuItems.helpDesk, menuItems.supervisor];
        otherItems = [menuItems.resolved];
        break;
      case UserRole.Technician:
        roleItems = [menuItems.helpDesk, menuItems.technician];
        otherItems = [menuItems.resolved];
        break;
      case UserRole.HelpDesk:
        roleItems = [menuItems.helpDesk];
        otherItems = [menuItems.resolved];
        break;
      default:
        break;
    }
    
    return { roleItems, otherItems };
  };

  const { roleItems, otherItems } = getVisibleMenuItems();

  return (
    <div className="flex h-full flex-col">
      <SidebarHeader>
        <Link href="/overview" className="flex items-center gap-2 p-2 font-semibold" aria-label="Home" onClick={handleLinkClick}>
             TDHS ICT Support Center
        </Link>
      </SidebarHeader>

      <div className="flex-1 overflow-y-auto">
        <SidebarMenu>
            <SidebarGroup>
                <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
                 <SidebarMenuItem>
                    <Link href="/overview" onClick={handleLinkClick}>
                        <SidebarMenuButton
                            isActive={pathname === "/overview"}
                            tooltip="Dashboard"
                        >
                            <LayoutDashboard />
                            <span>Overview</span>
                        </SidebarMenuButton>
                    </Link>
                </SidebarMenuItem>
            </SidebarGroup>
            
            {isLoading ? (
                <SidebarGroup>
                    <SidebarGroupLabel>Roles</SidebarGroupLabel>
                    <div className="p-2 space-y-2">
                        <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
                        <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
                    </div>
                </SidebarGroup>
            ) : (
                <>
                    {roleItems.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>Roles</SidebarGroupLabel>
                            {roleItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                <Link href={item.href} onClick={handleLinkClick}>
                                    <SidebarMenuButton
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>
                    )}
                    
                    {otherItems.length > 0 && (
                        <SidebarGroup>
                            <SidebarGroupLabel>System</SidebarGroupLabel>
                            {otherItems.map((item) => (
                                <SidebarMenuItem key={item.label}>
                                <Link href={item.href} onClick={handleLinkClick}>
                                    <SidebarMenuButton
                                        isActive={pathname.startsWith(item.href)}
                                        tooltip={item.label}
                                    >
                                        <item.icon />
                                        <span>{item.label}</span>
                                    </SidebarMenuButton>
                                </Link>
                                </SidebarMenuItem>
                            ))}
                        </SidebarGroup>
                    )}
                </>
            )}
        </SidebarMenu>
      </div>
    </div>
  );
}
