"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";
import { toast } from "sonner";
import { BadgeCheck, BadgeX } from "lucide-react";
import { useState } from "react";
import { Spinner } from "../shadcn/spinner";
import { Button } from "../shadcn/button";

export default function SignOut() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleSignOut = async () => {
        setLoading(true);
        const res = await authClient.signOut();
        if (res.data?.success) {
            router.push("/auth/signin");
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeCheck />
                        <div>
                            <div className="font-semibold">Déconnexion réussie</div>
                            <div className="text-sm opacity-90">Vous avez été déconnecté avec succès.</div>
                        </div>
                    </div>
                </div>
            ))
            setLoading(false);
        } else {
            toast.custom(() => (
                <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                    <div className="flex items-center gap-2">
                        <BadgeX />
                        <div>
                            <div className="font-semibold">Erreur lors de la déconnexion</div>
                            <div className="text-sm opacity-90">Vous n&apos;avez pas été déconnecté.</div>
                        </div>
                    </div>
                </div>
            ))
            setLoading(false);
        }
    };

    return (
        <>
            {loading ? 
                <button onClick={handleSignOut} disabled className="hover:cursor-pointer w-full flex justify-center items-center gap-2">
                    <Spinner /> Déconnexion en cours...
                </button>
            :
                <Button variant={"ghost"} onClick={handleSignOut} disabled={false} className="hover:cursor-pointer w-full flex justify-start">
                    <span>Se déconnecter</span>
                </Button>
            }
        </>

    );
}
