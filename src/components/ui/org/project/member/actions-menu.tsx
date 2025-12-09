"use client"

import * as React from "react"
import { Button } from "@/src/components/ui/shadcn/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/shadcn/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/src/components/ui/shadcn/dialog"
import { MoreHorizontal } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/shadcn/select"
import { ProjectMemberRole } from "@prisma/client"

type ActionsMenuProps = {
    userId: string
    userRole?: string
    onCopyId?: (id: string) => void
    onChangeRole?: (id: string, role: string) => void
}

export default function ActionsMenu({ userId, userRole, onCopyId, onChangeRole }: ActionsMenuProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false)
    const [role, setRole] = React.useState<string | undefined>(undefined);


    React.useEffect(() => {
        setRole(userRole || undefined);
    }, [userRole]);

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Ouvrir menu utilisateur</span>
                        <MoreHorizontal />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onCopyId?.(userId)}>
                        Copy user ID
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setDialogOpen(true)}>
                        Changer le rôle
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Modifier les accès du membre</DialogTitle>
                    </DialogHeader>
                    <DialogDescription>
                        Choisissez un nouveau rôle pour ce membre au sein du projet.
                    </DialogDescription>
                    <div className="grid gap-4">
                        <div className="grid gap-3">
                            <label htmlFor="role-1" className="text-sm">Rôle</label>
                            <Select onValueChange={setRole} value={role}>
                                <SelectTrigger className="w-full" id="role">
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value={ProjectMemberRole.ADMIN}>Administrateur</SelectItem>
                                        <SelectItem value={ProjectMemberRole.EDITOR}>Editeur</SelectItem>
                                        <SelectItem value={ProjectMemberRole.VIEWER}>Lecteur</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Retour</Button>
                        </DialogClose>
                        <Button onClick={() => { onChangeRole?.(userId, role || "member"); setDialogOpen(false); }}>Enregistrer les modifications</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
