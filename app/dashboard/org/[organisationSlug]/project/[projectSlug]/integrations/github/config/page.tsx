
import ProjectIntegrationGithubConfig from "@/src/components/ui/org/project/providers/github/config"
import { prisma } from "@/src/lib/prisma";

type Params = { organisationSlug: string, projectSlug: string };

export default async function GithubConfigPage({ params }: { params: Promise<Params> }) {

    const { organisationSlug, projectSlug } = await params;

    const providerInfo = await prisma.provider.findFirst({
        where: {
            project: {
                slug: projectSlug,
            },
            name: "github",
        },
        select: {
            url: true,
        }
    });
    
    
    return (
        <div className="container py-6">
            <h1 className="text-2xl font-bold mb-4">Configurer l&apos;intégration GitHub</h1>
            <ProjectIntegrationGithubConfig organisationSlug={organisationSlug} projectSlug={projectSlug} providerUrl={providerInfo?.url || ""} />
        </div>
    );
}