"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/src/components/ui/shadcn/form"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/shadcn/card"
import { Input } from "@/src/components/ui/shadcn/input"
import { Button } from "@/src/components/ui/shadcn/button"
import Link from "next/link"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/shadcn/select"
import { BadgeX, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Spinner } from "../../shadcn/spinner"
import { toast } from "sonner"

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Le nom doit comporter au moins 2 caractères.",
    }),
    type: z.enum(["personal", "education", "company", "other"]),
    plan: z.enum(["free", "pro"]),
})

export function NewOrganizationForm() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "personal",
            plan: "free",
        },
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true)
            fetch("/api/org/new", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(values),
            }).then(async (res) => {
                if (res.ok) {
                    const org = await res.json()
                    router.push(`/dashboard/org/${org.slug}`)
                } else {
                    const errorData = await res.json()
                    toast.custom(() => (
                        <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                            <div className="flex items-center gap-2">
                                <BadgeX />
                                <div>
                                    <div className="font-semibold">{errorData.error}</div>
                                </div>
                            </div>
                        </div>
                    ))
                }
            })
        } catch (error) {
            console.error("Erreur lors de la création de l'organisation", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Card className="w-full bg-accent">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <CardHeader className="border-b mt-2">
                        <CardTitle>Créer une nouvelle organisation</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom de l'organisation" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        Quel est le nom de votre entreprise ou de votre équipe ?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel><span>Type</span></FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="personal">Personnel</SelectItem>
                                                <SelectItem value="education">Éducation</SelectItem>
                                                <SelectItem value="company">Entreprise</SelectItem>
                                                <SelectItem value="other">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Qu’est-ce qui décrirait le mieux votre organisation ?
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="plan"
                            render={({ field }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="flex items-center justify-between">Plan<Link href="/dashboard/org/price" className="flex items-center">Tarifs <ExternalLink className="w-4 h-4 ml-1" /></Link></FormLabel>
                                    <FormControl>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Plan" />
                                            </SelectTrigger>
                                            <SelectContent defaultValue={field.value}>
                                                <SelectItem value="free">Gratuit - 0€/mois</SelectItem>
                                                <SelectItem value="pro">Pro - 10€/mois</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                    <FormDescription>
                                        Le plan s’applique à votre nouvelle organisation.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                        <Button type="submit" variant={"outline"}>
                            <Link href="/dashboard/organizations">
                                Annuler
                            </Link>
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Spinner />}
                            Créer l&apos;organisation
                        </Button>
                    </CardFooter>
                </form>
            </Form>
        </Card>

    )
}