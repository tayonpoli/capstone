// app-sidebar.tsx (Client Component)
"use client"

import { Session } from "next-auth"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Blocks, Waypoints, Sparkles, ShoppingBasket, SquareChartGantt, Boxes, PackageOpen, UsersRound, UserRoundCog } from "lucide-react"
import { NotificationBell } from "./NotificationBell"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const userRole = session?.user?.role || 'guest';
  const isAdminOwner = ['Admin', 'Owner'].includes(userRole);
  const isOwner = userRole === 'Owner';

  const data = {
    user: {
      id: session?.user?.id || "Guest",
      name: session?.user?.name || "Guest",
      email: session?.user?.email || "-",
      avatar: "/avatars/shadcn.jpg",
      role: userRole,
    },
    navMain: [
      { title: "Overview", url: "/", icon: Waypoints },
      ...(isAdminOwner ? [{
        title: "AI",
        url: "/ai",
        icon: Sparkles,
      }] : []),
      { title: "Sales", url: "/sales", icon: ShoppingBasket },
      { title: "Purchasing", url: "/purchase", icon: SquareChartGantt },
      // { title: "Expenses", url: "#", icon: CreditCard },
      { title: "Production", url: "/production", icon: Boxes },
      { title: "Inventory", url: "/product", icon: PackageOpen },
      { title: "Customers", url: "/customer", icon: UsersRound },
      ...(isAdminOwner ? [
        {
          title: "Staff",
          url: "/staff",
          icon: UsersRound,
        },
        {
          title: "Suppliers",
          url: "/supplier",
          icon: UsersRound
        },
      ] : []),
    ],
    navSecondary: [
      // { title: "Settings", url: "#", icon: LifeBuoy },
      ...(isOwner ? [{
        title: "User Management",
        url: "/user",
        icon: UserRoundCog,
      }] : []),
    ],
  }

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Blocks className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">MauManage</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <div className="mt-auto">
          <NotificationBell userId={data.user.id} />
          <NavSecondary items={data.navSecondary} className="mt-auto" />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
