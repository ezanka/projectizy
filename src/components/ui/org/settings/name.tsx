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

export default function OrganizationNameSettings({ organisationSlug }: { organisationSlug: string }) {

    const [orgInfo, setOrgInfo] = React.useState<Workspace | null>(null);
    const [name, setName] = React.useState<string>("");
    const router = useRouter();

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${organisationSlug}/get-org-info`);
                const data = await response.json();
                setOrgInfo(data);
                setName(data.name);
            } catch (error) {
                console.error("Error fetching organization details:", error);
            }
        };

        fetchOrgDetails();
    }, [organisationSlug]);

    const handleSave = async () => {
        try {
            const response = await fetch(`/api/org/${organisationSlug}/update`, {
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
                                <div className="text-sm opacity-90">Le nom de l'organisation a été mis à jour avec succès.</div>
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
            <CardContent className="flex items-center justify-between">
                <p>Nom de l&apos;organisation</p>
                <Input placeholder="Nom de l'organisation" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" />
            </CardContent>
            <Separator />
            <CardContent className="flex items-center justify-end gap-2">
                <Button onClick={() => setName(orgInfo?.name || "")} variant={"outline"} disabled={name === orgInfo?.name}>
                    Annuler
                </Button>
                <Button onClick={handleSave} disabled={name === orgInfo?.name}>
                    Enregistrer les modifications
                </Button>
            </CardContent>
        </Card>
    )
}