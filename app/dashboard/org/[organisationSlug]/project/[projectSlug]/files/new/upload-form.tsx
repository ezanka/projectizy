"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/src/components/ui/shadcn/input";
import { Button } from "@/src/components/ui/shadcn/button";
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/src/components/ui/shadcn/form";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

const formSchema = z.object({
    slug: z.string().min(1, "Slug requis").regex(/^[a-z0-9-]+$/i, "Slug invalide"),
    file: z
        .custom<File>((v) => v instanceof File, "Un fichier est requis")
        .refine((f) => f && f.size > 0, "Fichier vide"),
});

export default function UploadForm({
    defaultSlug = "",
}: {
    projectId: string;
    publisherId: string;
    defaultSlug?: string;
}) {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { slug: defaultSlug } as Partial<z.infer<typeof formSchema>>,
    });
    const router = useRouter();

    const pathname = usePathname();

    const organizationSlug = pathname.split("/")[3];
    const projectSlug = pathname.split("/")[5];

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const file = values.file;
            const res = await fetch(`/api/org/${organizationSlug}/project/${projectSlug}/upload?filename=${values.slug}`, {
                method: "POST",
                body: file,
            });
            if (!res.ok) {
                throw new Error("Erreur lors de l'upload du fichier");
            }
            router.push(`/dashboard/org/${organizationSlug}/project/${projectSlug}/files`);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Slug du fichier</FormLabel>
                            <FormControl><Input placeholder="contrat-presta-2025" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="file"
                    render={() => (
                        <FormItem>
                            <FormLabel>Fichier</FormLabel>
                            <FormControl>
                                <Input
                                    type="file"
                                    onChange={(e) => {
                                        const f = e.target.files?.[0];
                                        if (!f) return;
                                        form.setValue("file", f as File, { shouldValidate: true });
                                    }}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">Uploader</Button>
            </form>
        </Form>
    );
}
