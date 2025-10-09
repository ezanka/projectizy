"use client"

import { useEffect, useState } from "react"
import { Workspace } from "@/src/types/workspace"

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
            <h1>Lists des organisations</h1>
        </div>
    )
}
