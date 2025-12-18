"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/shadcn/card";
import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/src/components/ui/shadcn/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/shadcn/dialog";
import { Input } from "@/src/components/ui/shadcn/input";
import { Label } from "@/src/components/ui/shadcn/label";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DangerZone() {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [confirmText, setConfirmText] = React.useState("");
    const [isDeleting, setIsDeleting] = React.useState(false);
    const CONFIRMATION_TEXT = "SUPPRIMER MON COMPTE";

    const handleDeleteAccount = async () => {
        if (confirmText !== CONFIRMATION_TEXT) {
            return;
        }

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/user/delete-account`, {
                method: "DELETE",
            });

            const data = await response.json();

            if (response.ok) {
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck className="text-green-500" />
                            <div>
                                <div className="font-semibold">Compte supprimé</div>
                                <div className="text-sm opacity-90">Votre compte a été supprimé avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
                setIsOpen(false);
                setTimeout(() => {
                    router.push("/");
                }, 1500);
            } else {
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX className="text-red-500" />
                            <div>
                                <div className="font-semibold">Impossible de supprimer le compte</div>
                                <div className="text-sm opacity-90">{data.error}</div>
                                {data.organizations && data.organizations.length > 0 && (
                                    <div className="text-xs mt-2">
                                        <strong>Organisations dont vous êtes propriétaire :</strong>
                                        <ul className="list-disc list-inside mt-1">
                                            {data.organizations.map((org: string, index: number) => (
                                                <li key={index}>{org}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))
                setIsDeleting(false);
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeX className="text-red-500" />
                        <div>
                            <div className="font-semibold">Erreur</div>
                            <div className="text-sm opacity-90">Une erreur est survenue lors de la suppression</div>
                        </div>
                    </div>
                </div>
            ))
            setIsDeleting(false);
        }
    };

    return (
        <Card className="border-red-200 dark:border-red-900">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5" />
                    Zone de danger
                </CardTitle>
                <CardDescription>
                    Actions irréversibles sur votre compte
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 p-4">
                    <h3 className="font-semibold text-red-900 dark:text-red-100 mb-2">
                        Supprimer mon compte
                    </h3>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-4">
                        Une fois supprimé, votre compte ne pourra pas être récupéré. Toutes vos données
                        personnelles seront définitivement supprimées. Vous serez automatiquement retiré
                        de toutes vos organisations.
                    </p>

                    <Dialog open={isOpen} onOpenChange={setIsOpen}>
                        <DialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                                Supprimer mon compte
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <AlertTriangle className="h-5 w-5 text-red-600" />
                                    Confirmer la suppression du compte
                                </DialogTitle>
                                <DialogDescription className="pt-2">
                                    Cette action est <strong>irréversible</strong>. Toutes vos données seront
                                    définitivement supprimées.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                <div className="rounded-lg bg-red-50 dark:bg-red-950/50 p-4 space-y-2">
                                    <p className="text-sm font-semibold text-red-900 dark:text-red-100">
                                        Les éléments suivants seront supprimés :
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-red-800 dark:text-red-200 space-y-1">
                                        <li>Votre profil et vos informations personnelles</li>
                                        <li>Votre accès à toutes les organisations</li>
                                        <li>Vos tâches et commentaires</li>
                                        <li>Vos sessions actives</li>
                                    </ul>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirm">
                                        Pour confirmer, tapez <strong className="font-mono">{CONFIRMATION_TEXT}</strong>
                                    </Label>
                                    <Input
                                        id="confirm"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value)}
                                        placeholder={CONFIRMATION_TEXT}
                                        className="font-mono"
                                    />
                                </div>
                            </div>

                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setIsOpen(false);
                                        setConfirmText("");
                                    }}
                                    disabled={isDeleting}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDeleteAccount}
                                    disabled={confirmText !== CONFIRMATION_TEXT || isDeleting}
                                >
                                    {isDeleting ? "Suppression en cours..." : "Supprimer définitivement mon compte"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="text-xs text-muted-foreground">
                    <p>
                        <strong>Note :</strong> Si vous êtes propriétaire d&apos;organisations, vous devez d&apos;abord
                        transférer la propriété ou supprimer ces organisations avant de pouvoir supprimer votre compte.
                    </p>
                </div>
            </CardContent>
        </Card>
    )
}
