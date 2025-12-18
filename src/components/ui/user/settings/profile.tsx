"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import { Label } from "@/src/components/ui/shadcn/label";
import React from "react";
import { Separator } from "@/src/components/ui/shadcn/separator";
import { Button } from "@/src/components/ui/shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX, UserCircle } from "lucide-react";
import { Spinner } from "@/src/components/ui/shadcn/spinner";
import { User } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/shadcn/avatar";

export default function ProfileSettings() {
    const [user, setUser] = React.useState<User | null>(null);
    const [name, setName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [loading, setLoading] = React.useState(true);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/user/get-user`);
                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                    setName(data.name);
                    setEmail(data.email);
                } else {
                    toast.custom(() => (
                        <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2">
                                <BadgeX className="text-red-500" />
                                <div>
                                    <div className="font-semibold">Erreur</div>
                                    <div className="text-sm opacity-90">Impossible de récupérer vos informations</div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, []);

    const handleSave = async () => {
        try {
            setLoadingSave(true);
            const response = await fetch(`/api/user/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email }),
            });

            if (response.ok) {
                const updatedUser = await response.json();
                setUser(updatedUser);
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="text-green-500" />
                            <div>
                                <div className="font-semibold">Profil mis à jour</div>
                                <div className="text-sm opacity-90">Vos informations ont été mises à jour avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX className="text-red-500" />
                            <div>
                                <div className="font-semibold">Erreur lors de la mise à jour</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error("Error updating user:", error);
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeX className="text-red-500" />
                        <div>
                            <div className="font-semibold">Erreur</div>
                            <div className="text-sm opacity-90">Une erreur est survenue</div>
                        </div>
                    </div>
                </div>
            ))
        } finally {
            setLoadingSave(false);
        }
    };

    const handleReset = () => {
        if (user) {
            setName(user.name);
            setEmail(user.email);
        }
    };

    const hasChanges = user && (name !== user.name || email !== user.email);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserCircle className="h-5 w-5" />
                    Informations personnelles
                </CardTitle>
                <CardDescription>
                    Gérez vos informations de profil et votre pseudo
                </CardDescription>
            </CardHeader>
            {loading ? (
                <CardContent className="flex items-center justify-center py-8">
                    <p className="flex items-center gap-2">
                        <Spinner /> Chargement...
                    </p>
                </CardContent>
            ) : (
                <>
                    <CardContent className="flex flex-col gap-6">
                        {/* Avatar Section */}
                        <div className="flex items-center gap-4">
                            <Avatar className="h-20 w-20">
                                <AvatarImage src={user?.image || undefined} alt={name} />
                                <AvatarFallback className="text-2xl">
                                    {name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium">Photo de profil</p>
                                <p className="text-sm text-muted-foreground">
                                    Votre photo de profil provient de votre compte OAuth
                                </p>
                            </div>
                        </div>

                        <Separator />

                        {/* Name Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nom d&apos;affichage (pseudo)</Label>
                            <Input
                                id="name"
                                placeholder="Votre nom"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={loadingSave}
                                maxLength={100}
                            />
                            <p className="text-xs text-muted-foreground">
                                Ce nom sera visible par les autres membres de vos organisations
                            </p>
                        </div>

                        {/* Email Field */}
                        <div className="grid gap-2">
                            <Label htmlFor="email">Adresse email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="votre.email@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={true}
                            />
                            <p className="text-xs text-muted-foreground">
                                Cette adresse sera utilisée pour les notifications
                            </p>
                        </div>

                        {/* Account Info */}
                        <div className="rounded-lg bg-muted p-4">
                            <div className="grid gap-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">ID utilisateur</span>
                                    <span className="font-mono text-xs">{user?.id}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Membre depuis</span>
                                    <span>{new Date(user?.createdAt || "").toLocaleDateString("fr-FR", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric"
                                    })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Email vérifié</span>
                                    <span className={user?.emailVerified ? "text-green-600" : "text-orange-600"}>
                                        {user?.emailVerified ? "Oui" : "Non"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </CardContent>

                    <Separator />

                    <CardContent className="flex items-center justify-end gap-2 pt-6">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            disabled={!hasChanges || loadingSave}
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || loadingSave || !name.trim() || !email.trim()}
                        >
                            {loadingSave ? (
                                <span className="inline-flex items-center gap-2">
                                    <Spinner className="h-4 w-4" /> Enregistrement...
                                </span>
                            ) : (
                                "Enregistrer les modifications"
                            )}
                        </Button>
                    </CardContent>
                </>
            )}
        </Card>
    )
}
