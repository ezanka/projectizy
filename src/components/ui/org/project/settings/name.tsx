"use client"

import { Card, CardContent } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import React from "react";
import { Workspace } from "@/src/types/workspace";
import { Separator } from "@/src/components/ui/shadcn/separator";
import { Button } from "@/src/components/ui/shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/src/components/ui/shadcn/spinner";

export default function ProjectNameSettings({ organisationSlug, projectSlug }: { organisationSlug: string, projectSlug: string }) {

    const [orgInfo, setOrgInfo] = React.useState<Workspace | null>(null);
    const [name, setName] = React.useState<string>("");

    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);
    const [loadingSave, setLoadingSave] = React.useState(false);

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${projectSlug}/get-org-info`);
                const data = await response.json();
                setOrgInfo(data);
                setName(data.name);
            } catch (error) {
                console.error("Error fetching organization details:", error);
            }
        };

        fetchOrgDetails();

        const checkAuthorization = async () => {
            try {
                setLoadingAuth(true);
                const response = await fetch(`/api/org/${organisationSlug}/get-org-user`);
                if (response.ok) {
                    const user = await response.json();
                    if (user.id === user.id && (user.role === 'owner' || user.role === 'admin')) {
                        setAuthorized(true);
                    }
                } else {
                    setAuthorized(false);
                }
            } catch (error) {
                console.error("Error checking authorization:", error);
            } finally {
                setLoadingAuth(false);
            }
        };

        checkAuthorization();
    }, [organisationSlug]);

    const handleSave = async () => {
        try {
            setLoadingSave(true);
            const response = await fetch(`/api/org/${projectSlug}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });
            if (response.ok) {
                const updatedOrg = await response.json();
                setOrgInfo(updatedOrg);
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Mise à jour réussie</div>
                                <div className="text-sm opacity-90">Le nom de l&apos;organisation a été mis à jour avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
                router.push("/dashboard/organizations");
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX />
                            <div>
                                <div className="font-semibold">Erreur lors de la mise à jour</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
                setLoadingSave(false);
            }
        } catch (error) {
            console.error("Error updating organization name:", error);
        }
    };

    return (
        <Card>
            {loadingAuth ? (
                <CardContent className="flex items-center justify-center">
                    <p className="flex items-center gap-2"><Spinner /> Vérification des autorisations...</p>
                </CardContent>
            ) : (
                authorized ? (
                    <>
                        <CardContent className="flex items-center justify-between">
                            <p>Nom du projet</p>
                            <Input placeholder="Nom du projet" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" disabled={loadingSave} />
                        </CardContent>
                        <Separator />
                        <Separator />
                        <CardContent className="flex items-center justify-end gap-2">
                            <Button onClick={() => { setName(orgInfo?.name || ""); }} variant={"outline"} disabled={name === orgInfo?.name || loadingSave}>
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={name === orgInfo?.name || loadingSave}>
                                {loadingSave ? (
                                    <span className="inline-flex items-center gap-2">
                                        <Spinner className="h-4 w-4" /> Enregistrement en cours...
                                    </span>
                                ) : (
                                    "Enregistrer les modifications"
                                )}
                            </Button>
                        </CardContent>
                    </>

                ) : (
                    <CardContent>
                        <p className="text-red-500">Vous n&apos;êtes pas autorisé à modifier les paramètres de cette organisation.</p>
                    </CardContent>
                )
            )}

        </Card>
    )
}