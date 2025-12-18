import { NextRequest, NextResponse } from "next/server";
import { getUser, getSession } from "@/src/lib/auth-server";
import { prisma } from "@/src/lib/prisma";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getUser();
        const currentSession = await getSession();

        if (!user || !currentSession) {
            return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
        }

        const { sessionId } = await params;

        // Vérifier que la session appartient à l'utilisateur
        const session = await prisma.session.findUnique({
            where: { id: sessionId },
        });

        if (!session) {
            return NextResponse.json(
                { error: "Session non trouvée" },
                { status: 404 }
            );
        }

        if (session.userId !== user.id) {
            return NextResponse.json(
                { error: "Non autorisé" },
                { status: 403 }
            );
        }

        // Empêcher la suppression de la session actuelle
        if (session.id === currentSession.session.id) {
            return NextResponse.json(
                { error: "Vous ne pouvez pas supprimer votre session actuelle" },
                { status: 400 }
            );
        }

        // Supprimer la session
        await prisma.session.delete({
            where: { id: sessionId },
        });

        return NextResponse.json(
            { message: "Session supprimée avec succès" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting session:", error);
        return NextResponse.json(
            { error: "Erreur lors de la suppression de la session" },
            { status: 500 }
        );
    }
}
