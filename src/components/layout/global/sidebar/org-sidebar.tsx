"use client"

import { Calendar, Settings, ChevronsRight, Folders, Users } from "lucide-react"
import { useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
} from "@/src/components/ui/shadcn/sidebar"
import Link from "next/link"
import { usePathname } from "next/navigation"


function splitPathname(pathname: string) {
    const parts = pathname.split('/');
    return parts.length > 3 ? parts[3] : null;
}

export function OrgSidebar() {
    const { toggleSidebar, state, setOpen } = useSidebar()
    const pathname = usePathname()
    const [isHovered, setIsHovered] = useState(false)
    const actualPath = splitPathname(pathname || "")

    const items = [
        { title: "Projets", url: `/dashboard/org/${actualPath}`, icon: Folders },
        { title: "Equipe", url: `/dashboard/org/${actualPath}/teams`, icon: Users },
        { title: "Calendrier", url: `/dashboard/org/${actualPath}/calendar`, icon: Calendar },
        { title: "Paramètres", url: `/dashboard/org/${actualPath}/settings`, icon: Settings },
    ]


    const handleMouseEnter = () => {
        setIsHovered(true)
        if (state === "collapsed") {
            setOpen(true)
        }
    }

    const handleMouseLeave = () => {
        setIsHovered(false)
        if (state === "expanded" && isHovered) {
            setOpen(false)
        }
    }

    return (
        <Sidebar
            collapsible="icon"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="z-5"
        >
            <SidebarContent className="mt-16">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="flex flex-col space-y-1">
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link href={item.url} title={item.title} aria-label={item.title}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="py-2">
                <button
                    type="button"
                    onClick={toggleSidebar}
                    className="inline-flex justify-center items-center h-8 w-8 rounded-md border transition-colors hover:bg-muted"
                >
                    <ChevronsRight className={`h-4 w-4 transition-transform ${state === "collapsed" ? '' : 'rotate-180'}`} />
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}
