import { prisma } from "@/src/lib/prisma"
import { EyeOff, User } from "lucide-react"
import { Button } from "@/src/components/ui/shadcn/button"
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/src/components/ui/shadcn/empty"
import Link from "next/link"
import { ProjectMemberTable } from "@/src/components/ui/org/project/member/table"
import { getUser } from "@/src/lib/auth-server"
import { ProjectMemberRole } from "@prisma/client"

export default async function ProjectMembersPage({
    params,
}: {
    params: { organisationSlug: string, projectSlug: string, id: string }
}) {
    const { organisationSlug, projectSlug } = await params
        const user = await getUser();

    const workspaceType = await prisma.organization.findUnique({
        where: { slug: organisationSlug },
        select: { type: true },
    })

    const canAccess = await prisma.projectMember.findFirst({
        where: {
            project: { slug: projectSlug },
            userId: user?.id,
            role: { in: [ProjectMemberRole.OWNER, ProjectMemberRole.ADMIN, ProjectMemberRole.EDITOR] },
        },
    });

    if (workspaceType?.type === "personal") {
        return <div className="w-full flex justify-center items-center">
            <Empty>
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <User />
                    </EmptyMedia>
                    <EmptyTitle>Type d&apos;organisation incompatible</EmptyTitle>
                    <EmptyDescription>
                        Les équipes ne sont pas disponibles pour les organisations personnelles.
                    </EmptyDescription>
                </EmptyHeader>
                <EmptyContent>
                    <div className="flex gap-2">
                        <Button><Link href="/dashboard/organizations">Changer d&apos;organisation</Link></Button>
                        <Button variant="outline">Changer le type d&apos;organisation</Button>
                    </div>
                </EmptyContent>
            </Empty>
        </div>
    } else {
        return (
            <>
                {canAccess ? (
                    <ProjectMemberTable organizationSlug={organisationSlug} projectSlug={projectSlug} />
                ) : (
                    <Empty>
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <EyeOff />
                            </EmptyMedia>
                            <EmptyTitle>Vous n&apos;avez pas accès aux équipes</EmptyTitle>
                            <EmptyDescription>
                                Pour avoir accès aux équipes, veuillez vous rapprocher d&apos;un administrateur du projet.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <div className="flex gap-2">
                                <Button asChild><Link href={`/dashboard/org/${organisationSlug}`}>Voir les projets</Link></Button>
                                <Button variant="outline" asChild><Link href="/dashboard/organizations">Retourner aux organisations</Link></Button>
                            </div>
                        </EmptyContent>
                    </Empty>
                )}
            </>
        )
    }
}