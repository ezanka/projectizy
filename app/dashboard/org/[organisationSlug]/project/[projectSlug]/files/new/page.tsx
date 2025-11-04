import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import UploadForm from "./upload-form";

export default async function NewFilePage({
    params,
}: { params: { projectSlug: string } }) {
    const user = await getUser();
    const { projectSlug } = await params;
    if (!user) {
        throw new Error("Non authentifié");
    }

    const project = await prisma.project.findFirst({
        where: { slug: projectSlug },
        select: { id: true },
    });
    if (!project) throw new Error("Projet non trouvé");

    return (
        <div className="max-w-xl mx-auto p-6">
            <h1 className="text-xl font-semibold mb-4">Nouvel upload de fichier</h1>
            <UploadForm
                projectId={project.id}
                publisherId={user.id}
                defaultSlug={"test1"}
            />
        </div>
    );
}
