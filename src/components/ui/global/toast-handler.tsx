"use client"

import { useEffect, useRef } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { BadgeX, BadgeCheck, Info } from "lucide-react"

const toastMessages = {
    unauthorized: {
        title: "Accès refusé",
        message: "Vous n'êtes pas membre de cette organisation.",
        icon: <BadgeX className="text-red-500" />,
    },
    notFound: {
        title: "Non trouvé",
        message: "La ressource demandée n'existe pas.",
        icon: <BadgeX className="text-red-500" />,
    },
    success: {
        title: "Succès",
        message: "Opération réussie.",
        icon: <BadgeCheck className="text-green-500" />,
    },
    error: {
        title: "Erreur",
        message: "Une erreur s'est produite.",
        icon: <BadgeX className="text-red-500" />,
    },
    info: {
        title: "Information",
        message: "Information importante.",
        icon: <Info className="text-blue-500" />,
    },
} as const

export function ToastHandler() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const firedRef = useRef(false) 

    useEffect(() => {
        if (firedRef.current) return

        const toastType = searchParams.get("toast")
        const customMessage = searchParams.get("message")

        if (toastType && toastType in toastMessages) {
            firedRef.current = true

            const cfg = toastMessages[toastType as keyof typeof toastMessages]
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">{cfg.icon}
                        <div>
                            <div className="font-semibold">{cfg.title}</div>
                            <div className="text-sm opacity-90">{customMessage || cfg.message}</div>
                        </div>
                    </div>
                </div>
            ), { duration: 4000 })

            const url = new URL(window.location.href)
            url.searchParams.delete("toast")
            url.searchParams.delete("message")
            setTimeout(() => {
                router.replace(url.pathname + url.search)
            }, 1000)
        }
    }, [searchParams, router])

    return null
}
