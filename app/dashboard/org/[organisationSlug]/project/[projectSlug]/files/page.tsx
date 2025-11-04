import ProjectFilesTable from "@/src/components/ui/org/project/files/table";
import React from "react";

type Params = { organisationSlug: string; projectSlug: string };

export default async function ProjectFilesPage({ params }: { params: Params }) {

    const { organisationSlug, projectSlug } = await params;

    return (
        <div>
            <ul>
                <ProjectFilesTable organizationSlug={organisationSlug} projectSlug={projectSlug} />
            </ul>
        </div>
    );
}