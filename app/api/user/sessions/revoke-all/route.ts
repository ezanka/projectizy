import { NextResponse } from "next/server";
import { getUser, getSession } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";

export async function DELETE() {
    try {
        const user = await getUser();
        const currentSession = await getSession();

        if (!user || !currentSession) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        // Supprimer toutes les sessions sauf la session actuelle
        const result = await prisma.session.deleteMany({
            where: {
                userId: user.id,
                id: {
                    not: currentSession.session.id,
                },
            },
        });

        return NextResponse.json(
            {
                message: "Toutes les autres sessions ont été supprimées",
                count: result.count,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error revoking sessions:", error);
        return NextResponse.json(
            { error: "Erreur lors de la révocation des sessions" },
            { status: 500 }
        );
    }
}
