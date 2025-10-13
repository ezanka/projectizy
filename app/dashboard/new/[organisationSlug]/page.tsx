"use client"

import { NewProjectForm } from "@/src/components/ui/org/project/new/form"
import { usePathname } from "next/navigation";

export default function NewProjectPage() {  
    const pathname = usePathname();
    const pathSegments = pathname.split('/');
    const organisationSlug = pathSegments[3];

    return (
        <div className="container mx-auto w-full h-screen flex items-center justify-center">
            <NewProjectForm organisationSlug={organisationSlug} />
        </div>
    );
}