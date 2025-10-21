"use client"

import { Card, CardContent } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import React from "react";
import { Workspace } from "@/src/types/workspace";
import { Separator } from "@/src/components/ui/shadcn/separator";
import { Button } from "../../shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "../../shadcn/spinner";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "../../shadcn/select"
import { WorkspaceType } from "@/src/types/workspace";

const workspaceTypes: WorkspaceType[] = ["company", "education", "personal", "other"];

export default function OrganizationNameSettings({ organisationSlug }: { organisationSlug: string }) {

    const [orgInfo, setOrgInfo] = React.useState<Workspace | null>(null);
    const [name, setName] = React.useState<string>("");
    const [type, setType] = React.useState<WorkspaceType | null>(null);
    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${organisationSlug}/get-org-info`);
                const data = await response.json();
                setOrgInfo(data);
                setName(data.name);
                setType(data.type);
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
            const response = await fetch(`/api/org/${organisationSlug}/update`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, type }),
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
                            <p>Nom de l&apos;organisation</p>
                            <Input placeholder="Nom de l'organisation" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
                        </CardContent>
                        <Separator />
                        <CardContent className="flex items-center justify-between">
                            <p>Type de l&apos;organisation</p>
                            <Select value={type || ""} onValueChange={(value) => setType(value as WorkspaceType)}>
                                <SelectTrigger className="w-full max-w-xs">
                                    <SelectValue placeholder="Sélectionner un type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        {workspaceTypes.map((workspaceType) => (
                                            <SelectItem key={workspaceType} value={workspaceType}>{workspaceType}</SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </CardContent>
                        <Separator />
                        <CardContent className="flex items-center justify-end gap-2">
                            <Button onClick={() => { setName(orgInfo?.name || ""); setType(orgInfo?.type || null); }} variant={"outline"} disabled={name === orgInfo?.name && type === orgInfo?.type}>
                                Annuler
                            </Button>
                            <Button onClick={handleSave} disabled={name === orgInfo?.name && type === orgInfo?.type}>
                                Enregistrer les modifications
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