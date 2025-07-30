"use client"

import { Session } from "next-auth"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import { Blocks, Waypoints, ShoppingBasket, SquareChartGantt, Boxes, PackageOpen, UsersRound, UserRoundCog, CreditCard, Keyboard, HelpCircle, IdCardIcon } from "lucide-react"
import { NotificationBell } from "./NotificationBell"
import { NavProjects } from "./nav-projects"
import { useTranslations } from "next-intl"

interface AppSidebarProps {
  session: Session | null
}

export function AppSidebar({ session }: AppSidebarProps) {
  const userRole = session?.user?.role || 'guest';
  const isAdminOwner = ['Admin', 'Owner'].includes(userRole);
  const isOwner = userRole === 'Owner';

  const t = useTranslations('Sidebar');

  const data = {
    user: {
      id: session?.user?.id || "Guest",
      name: session?.user?.name || "Guest",
      email: session?.user?.email || "-",
      avatar: "/avatars/shadcn.jpg",
      role: userRole,
    },
    navMain: [
      { title: t('overview'), url: "/", icon: Waypoints },
      { title: t('pos'), url: "/pos", icon: Keyboard },
      { title: t('sales'), url: "/sales", icon: ShoppingBasket },
      { title: t('purchase'), url: "/purchase", icon: SquareChartGantt },
      ...(isAdminOwner ? [
        { title: t('expenses'), url: "/expenses", icon: CreditCard },
      ] : []),
      { title: t('inventory'), url: "/product", icon: PackageOpen },
      ...(isAdminOwner ? [
        { title: t('production'), url: "/production", icon: Boxes },
        {
          title: t('contacts.staff'),
          url: "/staff",
          icon: IdCardIcon,
        },
      ] : []),
    ],
    projects: [
      { title: t('contacts.customer'), url: "/customer", icon: UsersRound },
      ...(isAdminOwner ? [
        {
          title: t('contacts.vendor'),
          url: "/supplier",
          icon: UsersRound
        },
      ] : []),
    ],
    navSecondary: [
      ...(isOwner ? [{
        title: t('footer.user'),
        url: "/user",
        icon: UserRoundCog,
      }] : []),
      {
        title: t('guide'),
        url: "https://maumanage-docs.vercel.app",
        external: true,
        icon: HelpCircle
      },
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
        <NavProjects items={data.projects} />
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
