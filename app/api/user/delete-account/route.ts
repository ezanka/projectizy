import { NextResponse } from "next/server";
import { getUser } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";
import { MemberRole } from "@prisma/client";

export async function DELETE() {
    try {
        const user = await getUser();

        if (!user) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const ownedOrganizations = await prisma.member.findMany({
            where: {
                userId: user.id,
                role: MemberRole.OWNER,
            },
            include: {
                organization: true,
            },
        });

        if (ownedOrganizations.length > 0) {
            return NextResponse.json(
                {
                    error: "Vous devez d'abord transférer la propriété ou supprimer vos organisations",
                    organizations: ownedOrganizations.map((m) => m.organization.name),
                },
                { status: 400 }
            );
        }

        await prisma.user.delete({
            where: {
                id: user.id,
            },
        });

        return NextResponse.json(
            { message: "Compte supprimé avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting user account:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression du compte" },
            { status: 500 }
        );
    }
}