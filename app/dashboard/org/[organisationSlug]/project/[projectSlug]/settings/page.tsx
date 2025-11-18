
import ProjectNameSettings from "@/src/components/ui/org/project/settings/name";

export default function ProjectSettingsPage() {
    return (
        <>
            <div>Project Settings Page</div>
            <ProjectNameSettings organisationSlug={"example-org"} projectSlug={"example-slug"} />
        </>
    );
}