"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import React from "react";
import { Shield, Monitor, Smartphone, Globe, LogOut } from "lucide-react";
import { Button } from "@/src/components/ui/shadcn/button";
import { Spinner } from "@/src/components/ui/shadcn/spinner";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface Session {
    id: string;
    ipAddress: string | null;
    userAgent: string | null;
    createdAt: string;
    expiresAt: string;
    token: string;
}

export default function SecuritySettings() {
    const [sessions, setSessions] = React.useState<Session[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentSessionToken, setCurrentSessionToken] = React.useState<string | null>(null);
    const [revokingAll, setRevokingAll] = React.useState(false);
    const [revokingId, setRevokingId] = React.useState<string | null>(null);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/user/sessions');
            if (response.ok) {
                const data = await response.json();
                setSessions(data);

                const cookies = document.cookie.split(';');
                const sessionCookie = cookies.find(c => c.trim().startsWith('better-auth.session_token='));
                if (sessionCookie) {
                    const token = sessionCookie.split('=')[1];
                    setCurrentSessionToken(token);
                }
            }
        } catch (error) {
            console.error("Error fetching sessions:", error);
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeX className="text-red-500" />
                        <div>
                            <div className="font-semibold">Erreur</div>
                            <div className="text-sm opacity-90">Impossible de charger les sessions</div>
                        </div>
                    </div>
                </div>
            ))
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchSessions();
    }, []);

    const getDeviceIcon = (userAgent: string | null) => {
        if (!userAgent) return <Monitor className="h-4 w-4" />;

        if (userAgent.toLowerCase().includes("mobile") || userAgent.toLowerCase().includes("android") || userAgent.toLowerCase().includes("iphone")) {
            return <Smartphone className="h-4 w-4" />;
        }

        return <Monitor className="h-4 w-4" />;
    };

    const getBrowserName = (userAgent: string | null) => {
        if (!userAgent) return "Navigateur inconnu";

        if (userAgent.includes("Chrome")) return "Chrome";
        if (userAgent.includes("Firefox")) return "Firefox";
        if (userAgent.includes("Safari")) return "Safari";
        if (userAgent.includes("Edge")) return "Edge";

        return "Navigateur inconnu";
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            setRevokingId(sessionId);
            const response = await fetch(`/api/user/sessions/${sessionId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="text-green-500" />
                            <div>
                                <div className="font-semibold">Session révoquée</div>
                                <div className="text-sm opacity-90">La session a été déconnectée avec succès</div>
                            </div>
                        </div>
                    </div>
                ))
                fetchSessions();
            } else {
                const data = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX className="text-red-500" />
                            <div>
                                <div className="font-semibold">Erreur</div>
                                <div className="text-sm opacity-90">{data.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error("Error revoking session:", error);
        } finally {
            setRevokingId(null);
        }
    };

    const handleRevokeAll = async () => {
        try {
            setRevokingAll(true);
            const response = await fetch('/api/user/sessions/revoke-all', {
                method: "DELETE",
            });

            if (response.ok) {
                const data = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="text-green-500" />
                            <div>
                                <div className="font-semibold">Sessions révoquées</div>
                                <div className="text-sm opacity-90">
                                    {data.count} session(s) déconnectée(s) avec succès
                                </div>
                            </div>
                        </div>
                    </div>
                ))
                fetchSessions();
            } else {
                const data = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX className="text-red-500" />
                            <div>
                                <div className="font-semibold">Erreur</div>
                                <div className="text-sm opacity-90">{data.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error("Error revoking all sessions:", error);
        } finally {
            setRevokingAll(false);
        }
    };

    const isCurrentSession = (session: Session) => {
        return session.token === currentSessionToken;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Sécurité et sessions
                </CardTitle>
                <CardDescription>
                    Gérez vos sessions actives et la sécurité de votre compte
                </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <p className="flex items-center gap-2">
                            <Spinner /> Chargement des sessions...
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-3">
                                    Sessions actives ({sessions.length})
                                </h3>
                                <div className="space-y-3">
                                    {sessions.length === 0 ? (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            Aucune session active
                                        </p>
                                    ) : (
                                        sessions.map((session) => {
                                            const isCurrent = isCurrentSession(session);
                                            return (
                                                <div
                                                    key={session.id}
                                                    className={`flex items-start gap-3 p-4 border rounded-lg ${
                                                        isCurrent ? "bg-muted/50 border-green-200 dark:border-green-800" : ""
                                                    }`}
                                                >
                                                    <div className="mt-1">
                                                        {getDeviceIcon(session.userAgent)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="font-medium text-sm">
                                                                {getBrowserName(session.userAgent)}
                                                                {isCurrent && " (Actuelle)"}
                                                            </p>
                                                            {isCurrent && (
                                                                <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-100 px-2 py-0.5 rounded-full">
                                                                    Active
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                                            <Globe className="h-3 w-3" />
                                                            <span>{session.ipAddress || "IP inconnue"}</span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Créée{" "}
                                                            {formatDistanceToNow(new Date(session.createdAt), {
                                                                addSuffix: true,
                                                                locale: fr,
                                                            })}
                                                        </p>
                                                    </div>
                                                    {!isCurrent && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleRevokeSession(session.id)}
                                                            disabled={revokingId === session.id}
                                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        >
                                                            {revokingId === session.id ? (
                                                                <Spinner className="h-4 w-4" />
                                                            ) : (
                                                                <LogOut className="h-4 w-4" />
                                                            )}
                                                        </Button>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        {sessions.length > 1 && (
                            <div className="pt-4 border-t">
                                <h3 className="text-sm font-semibold mb-3">Actions de sécurité</h3>
                                <div className="space-y-2">
                                    <Button
                                        variant="outline"
                                        className="w-full justify-start"
                                        onClick={handleRevokeAll}
                                        disabled={revokingAll}
                                    >
                                        {revokingAll ? (
                                            <>
                                                <Spinner className="h-4 w-4 mr-2" />
                                                Déconnexion en cours...
                                            </>
                                        ) : (
                                            "Déconnecter tous les autres appareils"
                                        )}
                                    </Button>
                                    <p className="text-xs text-muted-foreground px-1">
                                        Déconnectez-vous de toutes les sessions sauf celle-ci ({sessions.length - 1}{" "}
                                        session{sessions.length - 1 > 1 ? "s" : ""})
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
