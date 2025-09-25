import * as React from "react"
import {
  PiggyBank,
  Trophy
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
// import { NavProjects } from "@/components/nav-projects"
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
  
  // This is sample data.
const data = {
  user: {
    name: user?.user_metadata?.full_name || "Usuário Anônimo",
    email: user?.email || "sem-email@example.com",
    avatar: user?.user_metadata?.avatar_url || "/default-avatar.png",
  },
  navMain: [
    {
      title: "Finanças",
      url: "#",
      icon: PiggyBank,
      isActive: true,
      items: [
        {
          title: "Dashboard",
          url: "/admin",
        },
        {
          title: "Investimentos",
          url: "/admin/finance/investments",
        },
        {
          title: "Parcelas",
          url: "/admin/finance/recurring",
        },
        {
          title: "Transações",
          url: "/admin/finance/transactions",
        },
        {
          title: "Dimensões",
          url: "/admin/finance/dimensions",
        }
      ],
    },
    {
      title: "Social",
      icon: Trophy,
      url: "#",
      isActive: true,
      items: [
        {
          title: "Gameficação",
          url: "/admin/social",
        }
      ],
    },
   /*  {
      title: "Cinema",
      icon: Clapperboard,
      url: "#",
      isActive: true,
      items: [
        {
          title: "Filmes",
          url: "/admin/movies",
        }
      ],
    }, */
    // {
    //   title: "Documentation",
    //   url: "#",
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: "Introduction",
    //       url: "#",
    //     },
    //     {
    //       title: "Get Started",
    //       url: "#",
    //     },
    //     {
    //       title: "Tutorials",
    //       url: "#",
    //     },
    //     {
    //       title: "Changelog",
    //       url: "#",
    //     },
    //   ],
    // },
    // {
    //   title: "Settings",
    //   url: "#",
    //   icon: Settings2,
    //   items: [
    //     {
    //       title: "General",
    //       url: "#",
    //     },
    //     {
    //       title: "Team",
    //       url: "#",
    //     },
    //     {
    //       title: "Billing",
    //       url: "#",
    //     },
    //     {
    //       title: "Limits",
    //       url: "#",
    //     },
    //   ],
    // },
  ],
  // projects: [
  //   {
  //     name: "Design Engineering",
  //     url: "#",
  //     icon: Frame,
  //   },
  //   {
  //     name: "Sales & Marketing",
  //     url: "#",
  //     icon: PieChart,
  //   },
  //   {
  //     name: "Travel",
  //     url: "#",
  //     icon: Map,
  //   },
  // ],
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
