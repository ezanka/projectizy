"use client"

import {usePathname} from "next/navigation"
import { ProjectTable } from "@/src/components/ui/org/project/table"

export default function OrganizationProjectPage() {
    const pathname = usePathname();
    const organizationSlug = pathname.split("/")[3];

    return (
        <>
            <div>Organization Project Page</div>
            <ProjectTable organizationSlug={organizationSlug} />
        </>
    );
}