"use client"

import { DropdownMenuItem } from "@/src/components/ui/shadcn/dropdown-menu"
import { useState, useEffect } from "react";
import { Notification } from "@/src/types/notifications";
import { Button } from "../../ui/shadcn/button";
import { Separator } from "../../ui/shadcn/separator";
import { toast } from "sonner";

export default function Notifications() {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        async function fetchNotifications() {
            const res = await fetch('/api/user/get-notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
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
        } catch (error) {
            toast.error("Erreur réseau lors du rejet de l'invitation");
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
        } catch (error) {
            toast.error("Erreur réseau lors de l'acceptation de l'invitation");
        }
    }

    return (
        <>
            {notifications.length === 0 ? (
                <DropdownMenuItem className="cursor-default">
                    Aucune notification
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem>
                    {notifications.map((notification, index) => (
                        <div key={notification.id}>
                            <div>
                                <p className="max-w-50">
                                    <span className="font-bold">{notification.email}</span> vous invite à rejoindre l'organisation suivante :
                                </p>
                                {notification.organization && (
                                    <ul>
                                        <li className="list-disc ml-4">{notification.organization.name}</li>
                                    </ul>
                                )}
                            </div>
                            <div className="flex items-center justify-between my-2">
                                <Button variant="destructive" onClick={() => rejectInvitation(notification.id)}>Refuser</Button>
                                <Button onClick={() => acceptInvitation(notification.id)}>Accepter</Button>
                            </div>
                            {index < notifications.length - 1 && <Separator className="my-2" />}
                        </div>
                    ))}
                </DropdownMenuItem>
            )}
        </>

    );
}
