
import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { getUser } from "@/src/lib/auth-server";

export async function GET() {
    const user = await getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const notifications = await prisma.invitation.findMany({
        where: { 
            email: user.email,
            status: "pending",
            inviterId: { not: user.id },
        },
        include: {
            organization: true,
        },
    });

    const inviterEmails = await Promise.all(
        notifications.map(async (invitation) => {
            const inviter = await prisma.user.findUnique({
                where: { id: invitation.inviterId },
            });
            return inviter ? inviter.email : null;
        })
    );

    const formattedNotifications = notifications.map(notification => ({
        id: notification.id,
        email: notification.email,
        status: notification.status,
        organization: notification.organization ? {
            id: notification.organization.id,
            name: notification.organization.name,
            slug: notification.organization.slug,
            createdAt: notification.organization.createdAt.toISOString(),
        } : null,
        inviterEmail: inviterEmails.shift() || null,
    }));

    return NextResponse.json(formattedNotifications, { status: 200 });
}