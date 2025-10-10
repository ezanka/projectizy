"use client"

import { useEffect, useState } from "react"
import { Workspace } from "@/src/types/workspace"
import { Skeleton } from "@/src/components/ui/shadcn/skeleton";
import { Card, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import Link from "next/link";

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
        <div>
            <h1 className="text-2xl font-bold mb-4">Listes des organisations</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? (
                    <Skeleton className="h-24 w-full" />
                ) : (
                    workspaces.map((workspace) => (
                        <Card key={workspace.id} className="bg-accent hover:bg-accent/90 transition h-24">
                            <Link href={`/dashboard/org/${workspace.slug}`} className="block">
                                <CardHeader>
                                    <CardTitle className="text-md">{workspace.name}</CardTitle>
                                    <CardDescription>{workspace.type} plan - 0 projet</CardDescription>
                                </CardHeader>
                            </Link>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
