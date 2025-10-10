"use client"

import { useState } from "react"
import { Calendar, Home, Inbox, Search, Settings, ChevronsLeft, ChevronsRight } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/src/components/ui/shadcn/sidebar"
import Link from "next/link"

const cx = (...cls: (string | false | null | undefined)[]) => cls.filter(Boolean).join(" ")

const items = [
    { title: "Home", url: "#", icon: Home },
    { title: "Inbox", url: "#", icon: Inbox },
    { title: "Calendar", url: "#", icon: Calendar },
    { title: "Search", url: "#", icon: Search },
    { title: "Settings", url: "#", icon: Settings },
]

export function OrgSidebar() {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <Sidebar
            data-collapsed={isCollapsed}
            className={cx(
                "transition-[width] duration-300 ease-in-out",
                "w-64",
                isCollapsed && "w-12" 
            )}
        >
            <SidebarContent
                className={cx(
                    "flex flex-col h-full mt-16",
                    isCollapsed && "items-center" 
                )}
            >
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className={cx(isCollapsed && "flex flex-col items-center gap-4")}>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className={cx(
                                            "flex items-center rounded-md",
                                            isCollapsed ? "justify-end" : "justify-start",
                                            "h-fit w-full",
                                            "transition-colors"
                                        )}
                                    >
                                        <Link href={item.url} title={item.title} aria-label={item.title}>
                                            <item.icon className="h-5 w-5 shrink-0" />
                                            <span
                                                className={cx(
                                                    "truncate",
                                                    "transition-all duration-200",
                                                    isCollapsed
                                                        ? "opacity-0 max-w-0 overflow-hidden"
                                                        : "opacity-100 max-w-[180px]"
                                                )}
                                            >
                                                {item.title}
                                            </span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter
                className={cx(
                    "flex items-center justify-center py-2 border-t border-border"
                )}
            >
                <button
                    type="button"
                    onClick={() => setIsCollapsed((v) => !v)}
                    className={cx(
                        "inline-flex justify-center items-center ",
                        "h-8 w-8 rounded-md border",
                        "transition-colors hover:bg-muted"
                    )}
                    aria-label={isCollapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
                    title={isCollapsed ? "Déplier" : "Replier"}
                >
                    {isCollapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
                </button>
            </SidebarFooter>
        </Sidebar>
    )
}
