// app-sidebar.tsx (Client Component)
"use client"

import { Session } from "next-auth"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Blocks, Waypoints, Sparkles, LifeBuoy, Send, ShoppingBasket, SquareChartGantt, CreditCard, Boxes, PackageOpen, UsersRound, UserRoundCog } from "lucide-react"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const data = {
    user: {
      name: session?.user?.name || "Guest",
      email: session?.user?.email || "-",
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      { title: "Overview", url: "/", icon: Waypoints },
      {
        title: "AI",
        url: "#",
        icon: Sparkles,
      },
      { title: "Sales", url: "/sales", icon: ShoppingBasket },
      { title: "Purchasing", url: "/purchase", icon: SquareChartGantt },
      // { title: "Expenses", url: "#", icon: CreditCard },
      { title: "Production", url: "#", icon: Boxes },
      { title: "Inventory", url: "/product", icon: PackageOpen },
      { title: "Customers", url: "/customer", icon: UsersRound },
      { title: "Suppliers", url: "/supplier", icon: UsersRound },
    ],
    navSecondary: [
      { title: "Settings", url: "#", icon: LifeBuoy },
      { title: "Users", url: "#", icon: UserRoundCog },
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
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
