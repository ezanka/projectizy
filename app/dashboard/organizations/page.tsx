"use client"

import { useEffect, useState } from "react"
import { Workspace } from "@/src/types/workspace"
import { Skeleton } from "@/src/components/ui/shadcn/skeleton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import Link from "next/link";
import { Button } from "@/src/components/ui/shadcn/button";

export default function OrgPage() {
    const [loading, setLoading] = useState(true);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        setLoading(true)
        const fetchWorkspaces = async () => {
            try {
                const res = await fetch("/api/org/get-org-workspaces")
                const data: Workspace[] = await res.json()
                setWorkspaces(data)
            } catch (error) {
                console.error("Failed to fetch workspaces:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchWorkspaces()
    }, [])

    return (
        <div className="p-8 max-w-6xl mx-auto w-full">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold">Vos organisations</h1>
                <Button asChild className="hidden sm:flex">
                    <Link href="/dashboard/organizations/new">
                        Créer une organisation
                    </Link>
                </Button>
                <Button asChild className="fixed bottom-4 right-4 sm:hidden">
                    <Link href="/dashboard/organizations/new">
                        Créer une organisation
                    </Link>
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                    </>
                ) : (
                    workspaces.map((workspace) => (
                        <Link key={workspace.id}href={`/dashboard/org/${workspace.slug}`} className="block h-full">
                            <Card className="bg-accent hover:bg-accent/90 transition h-24">
                                <CardHeader>
                                    <CardTitle className="text-md">{workspace.name}</CardTitle>
                                    <CardDescription>{workspace.type} - {workspace._count.projects} projet</CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}
