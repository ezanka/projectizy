import { prisma } from "@/src/lib/prisma"
import { User } from "lucide-react"
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

export default async function ProjectMembersPage({
    params,
}: {
    params: { organisationSlug: string, projectSlug: string, id: string }
}) {
    const { organisationSlug, projectSlug } = await params

    const workspaceType = await prisma.organization.findUnique({
        where: { slug: organisationSlug },
        select: { type: true },
    })

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
            <ProjectMemberTable organizationSlug={organisationSlug} projectSlug={projectSlug} />
        )
    }
}