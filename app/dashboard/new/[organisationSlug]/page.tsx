import { NewProjectForm } from "@/src/components/ui/org/project/new/form"

export default async function NewProjectPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params

    return (
        <div className="container mx-auto w-full h-screen flex items-center justify-center">
            <NewProjectForm organisationSlug={organisationSlug} />
        </div>
    );
}