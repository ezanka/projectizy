"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
    VisibilityState,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, Plus, MoreHorizontal } from "lucide-react"

import { Button } from "@/src/components/ui/shadcn/button"
import { Checkbox } from "@/src/components/ui/shadcn/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/src/components/ui/shadcn/dropdown-menu"
import ActionsMenu from "@/src/components/ui/org/team/actions-menu"
import { Input } from "@/src/components/ui/shadcn/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/src/components/ui/shadcn/table"
import { ButtonGroup } from "@/src/components/ui/shadcn/button-group"
import { UserBase } from "@/src/types/user"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter,
} from "@/src/components/ui/shadcn/dialog"
import { Label } from "@/src/components/ui/shadcn/label"
import { toast } from "sonner"
import { BadgeX, BadgeCheck } from "lucide-react"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/src/components/ui/shadcn/tooltip"
import { Spinner } from "../../shadcn/spinner"

export const columns = (
    adminUser: boolean,
    removeMember: (userId: string) => void,
    changeRoleMember: (userId: string, role: string) => void
): ColumnDef<UserBase>[] => [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Nom
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div>{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Email
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase">{row.getValue("email")}</div>,
        },
        {
            accessorKey: "role",
            header: "Rôle",
            cell: ({ row }) => <div className="capitalize">{row.getValue("role")}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <>
                        {row.getValue("role") === "owner" ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <span className="sr-only">Ouvrir menu utilisateur</span>
                                        <MoreHorizontal />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                        onClick={() => navigator.clipboard.writeText(user.id)}
                                    >
                                        Copy user ID
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            adminUser ? (
                                <ActionsMenu
                                    userId={user.id}
                                    userRole={user.role}
                                    onCopyId={(id) => navigator.clipboard.writeText(id)}
                                    onRemove={(id) => removeMember(id)}
                                    onChangeRole={(id, role) => changeRoleMember(id, role)}
                                />
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Ouvrir menu utilisateur</span>
                                            <MoreHorizontal />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => navigator.clipboard.writeText(user.id)}
                                        >
                                            Copy user ID
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )
                        )}

                    </>
                )
            },
        },
    ]

export function OrgTeamTable({ organizationSlug }: { organizationSlug: string }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [data, setData] = React.useState<UserBase[]>([])
    const [loading, setLoading] = React.useState(true)
    const [invitatingLoading, setInvitatingLoading] = React.useState(false)
    const [email, setEmail] = React.useState("")
    const [user, setUser] = React.useState<UserBase | null>(null)

    React.useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/org/${organizationSlug}/get-org-users`);
                const members = await response.json();
                setData(members);
            } catch (error) {
                console.error('Error fetching members:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const fetchUser = async () => {
            try {
                const response = await fetch(`/api/org/${organizationSlug}/get-org-user`);
                if (response.ok) {
                    const currentUser = await response.json();
                    setUser(currentUser);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setUser(null);
            }
        };

        fetchUser();
    }, [organizationSlug]);

    const adminUser = user?.role === "admin" || user?.role === "owner";

    const removeMember = async (userId: string) => {
        try {
            const response = await fetch(`/api/org/${organizationSlug}/remove-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                setData((prevData) => prevData.filter((member) => member.id !== userId));
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Membre supprimé</div>
                                <div className="text-sm opacity-90">Le membre a été supprimé avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX />
                            <div>
                                <div className="font-semibold">Erreur lors de la suppression du membre</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const changeRoleMember = async (userId: string, role: string) => {
        try {
            const response = await fetch(`/api/org/${organizationSlug}/change-role-member`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, role }),
            });

            if (response.ok) {
                setData((prevData) =>
                    prevData.map((member) =>
                        member.id === userId
                            ? { ...member, role }
                            : member
                    )
                );
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Rôle modifié</div>
                                <div className="text-sm opacity-90">Le rôle du membre a été modifié avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX />
                            <div>
                                <div className="font-semibold">Erreur lors de la modification du rôle</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
            }
        } catch (error) {
            console.error('Error removing member:', error);
        }
    };

    const inviteMember = async (email: string) => {
        try {
            setInvitatingLoading(true);
            const response = await fetch(`/api/org/${organizationSlug}/invite-member`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeCheck />
                            <div>
                                <div className="font-semibold">Invitation envoyée</div>
                                <div className="text-sm opacity-90">L&apos;invitation a été envoyée avec succès.</div>
                            </div>
                        </div>
                    </div>
                ))
            } else {
                const errorData = await response.json();
                toast.custom(() => (
                    <div className="bg-background text-foreground p-4 rounded-2xl shadow-lg">
                        <div className="flex items-center gap-2">
                            <BadgeX />
                            <div>
                                <div className="font-semibold">Erreur lors de l&apos;envoi de l&apos;invitation</div>
                                <div className="text-sm opacity-90">{errorData.error}</div>
                            </div>
                        </div>
                    </div>
                ))
                setInvitatingLoading(false);
            }
        } catch (error) {
            console.error('Error sending invitation:', error);
        }
    };

    const table = useReactTable({
        data,
        columns: columns(adminUser, removeMember, changeRoleMember),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4 justify-between">
                <Input
                    placeholder="Filtrer par nom..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <ButtonGroup>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="ml-auto">
                                Colonnes <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    )
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Dialog>
                        <form>
                            {adminUser ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <DialogTrigger asChild>
                                            <Button variant={"outline"} className="rounded-l-none hover:bg-primary/80 transition-all cursor-pointer">
                                                <Plus className="mr-2 h-4 w-4" />
                                                Nouveau membre
                                            </Button>
                                        </DialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Ajouter un membre</p>
                                    </TooltipContent>
                                </Tooltip>
                            ) : (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="inline-flex">
                                            <Button
                                                disabled
                                                variant={"outline"}
                                                className="rounded-l-none transition-all cursor-not-allowed"
                                            >
                                                <Plus className="mr-2 h-4 w-4" />
                                                Nouveau membre
                                            </Button>
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Rôle admin ou propriétaire requis.</p>
                                    </TooltipContent>
                                </Tooltip>
                            )}
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Inviter un membre</DialogTitle>
                                    <DialogDescription>
                                        Entrez l&apos;adresse e-mail du membre que vous souhaitez inviter.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4">
                                    <div className="grid gap-3">
                                        <Label htmlFor="email-1">Email</Label>
                                        <Input id="email-1" name="email" disabled={invitatingLoading} value={email} onChange={(e) => setEmail(e.target.value)} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose disabled={invitatingLoading} asChild>
                                        <Button variant="outline">Retour</Button>
                                    </DialogClose>
                                    <Button
                                        type="submit"
                                        disabled={invitatingLoading}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            await inviteMember(email);
                                        }}
                                    >
                                        {invitatingLoading ? (
                                            <span className="inline-flex items-center gap-2">
                                                <Spinner className="h-4 w-4" /> Invitation en cours...
                                            </span>
                                        ) : (
                                            "Inviter"
                                        )}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
                </ButtonGroup>
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {!loading ? (
                            table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected() && "selected"}
                                        className="hover:cursor-pointer"
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={table.getAllColumns().length}
                                        className="h-24 text-center"
                                    >
                                        Aucun membre.
                                    </TableCell>
                                </TableRow>
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={table.getAllColumns().length}
                                    className="h-24 text-center"
                                >
                                    Récupération des membres...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="text-muted-foreground flex-1 text-sm">
                    {table.getFilteredSelectedRowModel().rows.length} of{" "}
                    {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Précédent
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Suivant
                    </Button>
                </div>
            </div>
        </div>
    )
}