"use client"

import { Settings, ChevronsRight, Folders, Users, LayoutDashboard, NotepadText, Github, Figma, ShieldUser, ChartSpline } from "lucide-react"
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
import { Separator } from "@/src/components/ui/shadcn/separator"

export function ProjectSidebar() {
    const { toggleSidebar, state, setOpen } = useSidebar()
    const pathname = usePathname()
    const [isHovered, setIsHovered] = useState(false)
    const organisationSlug = pathname.split('/')[3] || ""
    const projectSlug = pathname.split('/')[5] || ""

    const items = [
        { title: "Aperçu", url: `/dashboard/org/${organisationSlug}/project/${projectSlug}`, icon: LayoutDashboard },
        { title: "Tâches", url: `/dashboard/org/${organisationSlug}/project/${projectSlug}/tasks`, icon: NotepadText },
        { title: "Statistiques", url: `/dashboard/org/${organisationSlug}/project/${projectSlug}/statistics`, icon: ChartSpline },
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
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/github`} title="Intégrations Github" aria-label="Intégrations Github">
                                        <Github />
                                        <span>Github</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/figma`} title="Intégrations Figma" aria-label="Intégrations Figma">
                                        <Figma />
                                        <span>Figma</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/integrations/notion`} title="Intégrations Notion" aria-label="Intégrations Notion">
                                        <Folders />
                                        <span>Notion</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/members`} title="Gestion des membres" aria-label="Gestion des membres">
                                        <Users />
                                        <span>Membres</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/roles`} title="Gestion des rôles" aria-label="Gestion des rôles">
                                        <ShieldUser />
                                        <span>Rôles</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <Separator />
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Link href={`/dashboard/org/${organisationSlug}/project/${projectSlug}/settings`} title="Paramètres" aria-label="Paramètres">
                                        <Settings />
                                        <span>Paramètres</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
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
