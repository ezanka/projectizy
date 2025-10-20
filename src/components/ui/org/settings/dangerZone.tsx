"use client"

import { Card, CardContent } from "@/src/components/ui/shadcn/card";
import { Input } from "@/src/components/ui/shadcn/input";
import React from "react";
import { Workspace } from "@/src/types/workspace";
import { Button } from "../../shadcn/button";
import { toast } from "sonner";
import { BadgeCheck, BadgeX, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { Spinner } from "../../shadcn/spinner";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/shadcn/dialog"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/shadcn/form"

const formSchema = z.object({
    organisationName: z.string().min(2).max(50),
})

export default function OrganizationDangerZoneSettings({ organisationSlug }: { organisationSlug: string }) {

    const [orgInfo, setOrgInfo] = React.useState<Workspace | null>(null);
    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            organisationName: "",
        },
    })

    React.useEffect(() => {
        const fetchOrgDetails = async () => {
            try {
                const response = await fetch(`/api/org/${organisationSlug}/get-org-info`);
                const data = await response.json();
                setOrgInfo(data);
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

    async function handleDelete(values: z.infer<typeof formSchema>) {
        if (values.organisationName !== orgInfo?.name) {
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeX />
                        <div>
                            <div className="font-semibold">Le nom de l&apos;organisation ne correspond pas</div>
                        </div>
                    </div>
                </div>
            ))
            return;
        }

        try {
            const response = await fetch(`/api/org/${organisationSlug}/delete`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            });
            if (response.ok) {
                const updatedOrg = await response.json();
                setOrgInfo(updatedOrg);
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Suppréssion réussie</div>
                                <div className="text-sm opacity-90">L&apos;organisation a été supprimée avec succès.</div>
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
                                <div className="font-semibold">Erreur lors de la suppression</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error("Error deleting organization:", error);
        }
    };

    return (
        <Card className="border-red-800 bg-red-900/10">
            {loadingAuth ? (
                <CardContent className="flex items-center justify-center">
                    <p className="flex items-center gap-2"><Spinner /> Vérification des autorisations...</p>
                </CardContent>
            ) : (
                authorized ? (
                    <>
                        <CardContent className="flex flex-col gap-4">
                            <p className="font-semibold text-primary">La suppression de ce projet supprimera également votre base de données.</p>
                            <p className="text-muted-foreground">Assurez-vous d&apos;avoir effectué une sauvegarde si vous souhaitez conserver vos données</p>
                            <div className="flex items-center justify-end gap-2">
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button type="button" className="border-red-800 bg-red-900/50 text-white hover:bg-red-900/70 hover:border-red-900">
                                            Supprimer l&apos;organisation
                                        </Button>
                                    </DialogTrigger>

                                    <DialogContent className="sm:max-w-[425px]">
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(handleDelete)}>
                                                <DialogHeader>
                                                    <DialogTitle>Confirmer la suppression de l&apos;organisation</DialogTitle>
                                                    <div className="flex items-center text-center gap-2 bg-accent px-4 py-2 rounded-md">
                                                        <span className="text-red-500"><TriangleAlert /></span>
                                                        <p>Cette action est irréversible.</p>
                                                    </div>
                                                    <DialogDescription className="mb-2">
                                                        Assurez-vous d&apos;avoir effectué une sauvegarde si vous souhaitez conserver vos données.
                                                    </DialogDescription>
                                                </DialogHeader>

                                                <div className="grid gap-4 mb-4">
                                                    <div className="grid gap-3">
                                                        <FormField
                                                            control={form.control}
                                                            name="organisationName"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>
                                                                        Taper <span className="font-black">&apos;{orgInfo?.name}&apos;</span> pour confirmer
                                                                    </FormLabel>
                                                                    <FormControl>
                                                                        <Input placeholder="Taper le nom de l'organisation" {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <DialogFooter>
                                                    <DialogClose asChild>
                                                        <Button type="button" variant="outline">Annuler</Button>
                                                    </DialogClose>
                                                    <Button type="submit">Supprimer</Button>
                                                </DialogFooter>
                                            </form>
                                        </Form>
                                    </DialogContent>
                                </Dialog>
                            </div>
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