import { OrgTeamTable } from "@/src/components/ui/org/team/table"
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
import { getUser } from "@/src/lib/auth-server"
import { MemberRole } from "@prisma/client"

export default async function OrganizationTeamsPage({
    params,
}: {
    params: { organisationSlug: string }
}) {
    const { organisationSlug } = await params;
    const user = await getUser();

    const workspaceType = await prisma.organization.findUnique({
        where: { slug: organisationSlug },
        select: { type: true },
    })

    const canAccess = await prisma.member.findFirst({
        where: {
            organization: { slug: organisationSlug },
            userId: user?.id,
            role: { in: [MemberRole.OWNER, MemberRole.ADMIN, MemberRole.MEMBER] },
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
    }

    return (
        <div>
            <h1 className="text-xl font-semibold mb-4">Organization Teams</h1>
            {canAccess ? (
                <OrgTeamTable organizationSlug={organisationSlug} />
            ) : (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <EyeOff />
                        </EmptyMedia>
                        <EmptyTitle>Vous n&apos;avez pas accès aux équipes</EmptyTitle>
                        <EmptyDescription>
                            Pour avoir accès aux équipes, veuillez vous rapprocher d&apos;un administrateur de votre organisation.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <div className="flex gap-2">
                            <Button><Link href={`/dashboard/org/${organisationSlug}`}>Voir les projets</Link></Button>
                            <Button variant="outline"><Link href="/dashboard/organizations">Retourner aux organisations</Link></Button>
                        </div>
                    </EmptyContent>
                </Empty>
            )}
        </div>
    )
}
