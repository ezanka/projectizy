import "server-only";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";
import { redirect } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";

type VerifyOrgOptions = {
    slug: string;
    allowedRoles?: string[];
    redirectTo?: string;
};

export async function verifyOrg({
    slug,
    allowedRoles,
    redirectTo = "/dashboard/organizations",
}: VerifyOrgOptions) {
    noStore(); 

    const user = await getUser();
    if (!user) {
        redirect("/");
    }

    const org = await prisma.organization.findUnique({
        where: { slug },
        select: {
        id: true,
        name: true,
        slug: true,
        members: {
            where: { userId: user.id },
            select: { id: true, role: true, userId: true },
        },
        },
    });

    if (!org) {
        redirect(redirectTo);
    }

    const membership = org.members[0];
    if (!membership) {
        redirect(redirectTo);
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const ok = allowedRoles.includes(String(membership.role));
        if (!ok) {
        redirect(redirectTo);
        }
    }

    return {
        user,
        org: { id: org.id, name: org.name, slug: org.slug },
        membership,
    };
}
