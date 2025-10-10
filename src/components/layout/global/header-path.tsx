"use client"

import { useEffect, useState } from "react"
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
import { Check, ChevronsUpDown, Folders, Plus, SearchIcon } from "lucide-react"
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

export default function HeaderPath() {
    const pathname = usePathname()
    const isOrgRoot = pathname === "/dashboard/org"
    const slugMatch = pathname.match(/^\/dashboard\/org\/([^/]+)$/)
    const isOrgDetail = Boolean(slugMatch)
    const currentSlug = slugMatch?.[1]

    const [workspaces, setWorkspaces] = useState<Workspace[]>([])
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
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
            } finally {
                setLoading(false)
            }
        }
        fetchWorkspaces()
    }, [currentSlug])

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                        <Link href={"/dashboard/org"} className="flex items-center">
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
                <BreadcrumbSeparator />
                {isOrgRoot && (
                    <>
                        <BreadcrumbPage>
                            <BreadcrumbLink asChild>
                                <Link
                                    href="/dashboard/org"
                                    className="flex items-center gap-2 transition"
                                >
                                    Organisations
                                </Link>
                            </BreadcrumbLink>
                        </BreadcrumbPage>
                    </>
                )} 


                {isOrgDetail && (
                    <>
                        <BreadcrumbItem>
                            <div className="flex items-center gap-2">
                                <BreadcrumbPage>
                                    {loading ? (
                                        <Skeleton className="w-20 h-5" />
                                    ) : (
                                        <div className="flex items-center gap-2">                                      
                                            {currentWorkspace?.name}
                                            {currentWorkspace?.type === "personal" && <p className="bg-sidebar/90 text-foreground text-xs px-2 py-0.5 border rounded-full">Personnel</p>}
                                            {currentWorkspace?.type === "business" && <p className="bg-sidebar/90 text-foreground text-xs px-2 py-0.5 border rounded-full">Entreprise</p>}
                                            {currentWorkspace?.type === "school" && <p className="bg-sidebar/90 text-foreground text-xs px-2 py-0.5 border rounded-full">École</p>}
                                            {currentWorkspace?.type === "free" && <p className="bg-sidebar/90 text-foreground text-xs px-2 py-0.5 border rounded-full">Gratuit</p>}
                                        </div>
                                    )}
                                </BreadcrumbPage>

                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-1 hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 text-sm font-medium transition">
                                        <ChevronsUpDown className="w-4 h-4" />
                                        <span className="sr-only">Changer d’organisation</span>
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
                                                <Link href={`/dashboard/org/${w.slug}`} className={`${w.id === currentWorkspace?.id ? "bg-accent text-accent-foreground" : ""} my-1 flex items-center justify-between hover:cursor-pointer`}>{w.name}{w.id === currentWorkspace?.id ? <Check className="w-4 h-4 ml-2" /> : null}</Link>
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/org">Toutes les Organisations</Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem asChild>
                                            <Link href="/dashboard/org/new">
                                                <Plus className="w-4 h-4 mr-1" /> Nouvelle Organisation
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </BreadcrumbItem>                       
                    </>
                )}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
