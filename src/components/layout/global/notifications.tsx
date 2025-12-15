"use client"

import { DropdownMenuItem } from "@/src/components/ui/shadcn/dropdown-menu"
import { useState, useEffect } from "react";
import { Notification } from "@/src/types/notifications";
import { Button } from "../../ui/shadcn/button";
import { Separator } from "../../ui/shadcn/separator";
import { toast } from "sonner";
import { MemberRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useOrgRefresh } from "@/src/components/wrappers/acceptOrg";
import { Spinner } from "../../ui/shadcn/spinner";

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const router = useRouter();
    const { refresh } = useOrgRefresh()

    useEffect(() => {
        async function fetchNotifications() {
            setLoading(true);
            const res = await fetch('/api/user/get-notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setLoading(false);
            }
        }

        fetchNotifications();
    }, []);

    const rejectInvitation = async (id: string) => {
        try {
            const res = await fetch('/api/user/reject-notification', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) toast.success("Invitation refusée");
            router.refresh();
        } catch (error) {
            toast.error("Erreur réseau lors du rejet de l'invitation : " + String(error));
        }
    }

    const acceptInvitation = async (id: string) => {
        try {
            const res = await fetch('/api/user/accept-notification', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            if (res.ok) toast.success("Invitation acceptée");
            refresh()
            router.refresh()
        } catch (error) {
            toast.error("Erreur réseau lors de l'acceptation de l'invitation : " + String(error));
        }
    }

    return (
        <>
            {loading ? (
                <DropdownMenuItem className="cursor-default">
                    <Spinner /> Récupération des notifications...
                </DropdownMenuItem>
            ) : (
                notifications.length === 0 ? (
                    <DropdownMenuItem className="cursor-default">
                        Aucune notification
                    </DropdownMenuItem>
                ) : (
                    notifications.map((notification, index) => (
                        <div key={notification.id} className="max-w-75">
                            <DropdownMenuItem>
                                <div>
                                    <div>
                                        <p>
                                            <span className="font-bold">{notification.inviterEmail}</span> vous invite à rejoindre l&apos;organisation <strong>{notification?.organization?.name}</strong> en tant que <strong>{notification.role === MemberRole.ADMIN ? "Administrateur" : notification.role === MemberRole.MEMBER ? "Membre" : notification.role === MemberRole.VIEWER ? "Lecteur" : "Inconnu"}</strong>
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between my-2">
                                        <Button className="cursor-pointer" variant="destructive" onClick={() => rejectInvitation(notification.id)}>Refuser</Button>
                                        <Button className="cursor-pointer" onClick={() => acceptInvitation(notification.id)}>Accepter</Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                            {index < notifications.length - 1 && <Separator className="my-2" />}
                        </div>
                    ))
                )
            )}
        </>

    );
}
