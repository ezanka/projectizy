"use client"

import { useEffect, useState, useMemo } from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/src/components/ui/shadcn/breadcrumb"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/shadcn/dropdown-menu"
import { Check, ChevronsUpDown, Plus, SearchIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/src/components/ui/shadcn/input-group"
import { Skeleton } from "@/src/components/ui/shadcn/skeleton"
import { Workspace } from "@/src/types/workspace"
import Image from "next/image"

interface BreadcrumbConfig {
    pattern: RegExp
    getItems: (pathname: string, workspace?: Workspace | null) => BreadcrumbItemConfig[]
}

interface BreadcrumbItemConfig {
    path?: string
    label: string | React.ReactNode
    isCurrentPage?: boolean
    showWorkspaceSelector?: boolean
}

const getWorkspaceLabel = (workspace: Workspace | null) => {
    if (!workspace) return <Skeleton className="w-20 h-5" />

    const typeLabels = {
        personal: "Personnel",
        company: "Entreprise",
        education: "Éducation",
        other: "Autre"
    }

    return (
        <div className="flex items-center gap-2">
            {workspace.name}
            <span className="bg-sidebar/90 text-foreground text-xs px-2 py-0.5 border rounded-full">
                {typeLabels[workspace.type]}
            </span>
        </div>
    )
}

const getBreadcrumbConfig = (workspace: Workspace | null): BreadcrumbConfig[] => [
    {
        pattern: /^\/dashboard\/org\/([^/]+)$/,
        getItems: () => [
            { path: "/dashboard/organizations", label: "Organisations" },
            {
                label: getWorkspaceLabel(workspace),
                isCurrentPage: true,
                showWorkspaceSelector: true
            }
        ]
    },
    {
        pattern: /^\/dashboard\/org\/([^/]+)\/teams$/,
        getItems: () => [
            { path: "/dashboard/organizations", label: "Organisations" },
            {
                label: getWorkspaceLabel(workspace),
                isCurrentPage: true,
                showWorkspaceSelector: true
            },
        ]
    },
    {
        pattern: /^\/dashboard\/org\/([^/]+)\/calendar$/,
        getItems: () => [
            { path: "/dashboard/organizations", label: "Organisations" },
            {
                label: getWorkspaceLabel(workspace),
                isCurrentPage: true,
                showWorkspaceSelector: true
            },
        ]
    },
    {
        pattern: /^\/dashboard\/org\/([^/]+)\/settings$/,
        getItems: () => [
            { path: "/dashboard/organizations", label: "Organisations" },
            {
                label: getWorkspaceLabel(workspace),
                isCurrentPage: true,
                showWorkspaceSelector: true
            },
        ]
    },
]

export default function HeaderPath() {
    const pathname = usePathname()
    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)

    const currentSlug = useMemo(() => {
        const match = pathname.match(/^\/dashboard\/org\/([^/]+)/)
        return match?.[1]
    }, [pathname])

    useEffect(() => {
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch("/api/org/get-org-workspaces")
                const data: Workspace[] = await res.json()
                setWorkspaces(data)
                if (currentSlug) {
                    setCurrentWorkspace(data.find(w => w.slug === currentSlug) || null)
                } else {
                    setCurrentWorkspace(null)
                }
            } catch (error) {
                console.error("Failed to fetch workspaces:", error)
            }
        }
        fetchWorkspaces()
    }, [currentSlug])

    const breadcrumbItems = useMemo(() => {
        const config = getBreadcrumbConfig(currentWorkspace).find(c => c.pattern.test(pathname))
        if (!config) return []
        return config.getItems(pathname, currentWorkspace)
    }, [pathname, currentWorkspace])

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href="/dashboard/organizations" className="flex items-center">
                            <Image
                                src="/logo-crop.png"
                                alt="Logo"
                                width={32}
                                height={32}
                                className="rounded"
                            />
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {breadcrumbItems.map((item, index) => (
                    <div key={index} className="flex items-center">
                        <BreadcrumbSeparator />
                        <BreadcrumbItem className="ml-2">
                            {item.isCurrentPage ? (
                                <div className="flex items-center gap-2 ml-2">
                                    <BreadcrumbPage>
                                        {item.path ? (
                                            <BreadcrumbLink asChild>
                                                <Link href={item.path} className="flex items-center gap-2 transition">
                                                    {item.label}
                                                </Link>
                                            </BreadcrumbLink>
                                        ) : (
                                            item.label
                                        )}
                                    </BreadcrumbPage>

                                    {item.showWorkspaceSelector && (
                                        <DropdownMenu>
                                            <DropdownMenuTrigger className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 text-sm font-medium transition">
                                                <ChevronsUpDown className="w-4 h-4" />
                                                <span className="sr-only">Changer d&apos;organisation</span>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="start">
                                                <InputGroup className="border-none">
                                                    <InputGroupInput placeholder="Search..." />
                                                    <InputGroupAddon>
                                                        <SearchIcon />
                                                    </InputGroupAddon>
                                                </InputGroup>
                                                <DropdownMenuSeparator />
                                                {workspaces.map((w) => (
                                                    <DropdownMenuItem key={w.id} asChild>
                                                        <Link
                                                            href={`/dashboard/org/${w.slug}`}
                                                            className={`${w.id === currentWorkspace?.id ? "bg-accent text-accent-foreground" : ""} my-1 flex items-center justify-between hover:cursor-pointer`}
                                                        >
                                                            {w.name}
                                                            {w.id === currentWorkspace?.id ? <Check className="w-4 h-4 ml-2" /> : null}
                                                        </Link>
                                                    </DropdownMenuItem>
                                                ))}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/dashboard/organizations">Toutes les Organisations</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href="/dashboard/organizations/new">
                                                        <Plus className="w-4 h-4 mr-1" /> Nouvelle Organisation
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    )}
                                </div>
                            ) : (
                                <BreadcrumbLink asChild>
                                    <Link href={item.path!} className="flex items-center gap-2 transition">
                                        {item.label}
                                    </Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </div>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}