
import ProjectIntegrationGithubConfig from "@/src/components/ui/org/project/providers/github/config"

export default function GithubConfigPage() {
    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-4">Configurer l'intégration GitHub</h1>
            <ProjectIntegrationGithubConfig organisationSlug={"example-org"} projectSlug={"example-project"} />
        </div>
    );
}