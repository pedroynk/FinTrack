import * as React from "react"
import {
  Clapperboard,
  PiggyBank,
  Trophy
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { useAuth } from "@/hooks/useAuth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

const data = {
  user: {
    name: user?.user_metadata?.full_name || "Usuário Anônimo",
    email: user?.email || "sem-email@example.com",
    avatar: user?.user_metadata?.avatar_url || "/default-avatar.png",
  },
  navMain: [
    {
      title: "Finanças",
      color:"#FACC15",
      url: "#",
      icon: PiggyBank,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin",
        },
        {
          title: "Dimensões",
          url: "/admin/finance/dimensions",
        },
        {
          title: "Parcelas",
          url: "/admin/finance/recurring",
        },
        {
          title: "Transações",
          url: "/admin/finance/transactions",
        },

      ],
    },
    {
      title: "Cinema",
      color:"#FACC15",
      icon: Clapperboard,
      url: "#",
      isActive: true,
      items: [
        {
          title: "Filmes",
          url: "/admin/movies",
        }
      ],
    },
  ],
}


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
