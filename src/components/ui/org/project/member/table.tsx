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
import { ArrowUpDown, ChevronDown, MoreHorizontal, BookOpenText, ShieldUser, UserStar, UserRoundX, UserPen } from "lucide-react"

import { Button } from "@/src/components/ui/shadcn/button"
import { Checkbox } from "@/src/components/ui/shadcn/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuItem,
} from "@/src/components/ui/shadcn/dropdown-menu"
import ActionsMenu from "@/src/components/ui/org/project/member/actions-menu"
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
import { toast } from "sonner"
import { BadgeX, BadgeCheck } from "lucide-react"
import { ProjectMemberRole } from "@prisma/client";

export const columns = (
    adminUser: boolean,
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
            cell: ({ row }) => <div className="capitalize">{row.getValue("role") === ProjectMemberRole.VIEWER ? <div className="flex items-center gap-2"><BookOpenText className="w-4" /> Lecteur</div> : row.getValue("role") === ProjectMemberRole.EDITOR ? <div className="flex items-center gap-2"><UserPen className="w-4" /> Editeur</div> : row.getValue("role") === ProjectMemberRole.ADMIN ? <div className="flex items-center gap-2"><ShieldUser className="w-4" /> Administrateur</div> : row.getValue("role") === ProjectMemberRole.OWNER ? <div className="flex items-center gap-2"><UserStar className="w-4" /> Propriétaire</div> : <div className="flex items-center gap-2"><UserRoundX className="w-4" /> Indéfini</div>}</div>,
        },
        {
            id: "actions",
            enableHiding: false,
            header: "Actions",
            cell: ({ row }) => {
                const user = row.original
                return (
                    <>
                        {row.getValue("role") === ProjectMemberRole.OWNER ? (
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

export function ProjectMemberTable({ organizationSlug, projectSlug }: { organizationSlug: string, projectSlug: string }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [data, setData] = React.useState<UserBase[]>([])
    const [loading, setLoading] = React.useState(true)
    const [user, setUser] = React.useState<UserBase | null>(null)

    React.useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/org/${organizationSlug}/project/${projectSlug}/get-project-users`);
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
    }, [organizationSlug, projectSlug]);

    const adminUser = user?.role === ProjectMemberRole.ADMIN || user?.role === ProjectMemberRole.OWNER;

    const changeRoleMember = async (userId: string, role: string) => {
        try {
            const response = await fetch(`/api/org/${organizationSlug}/project/${projectSlug}/change-role-member`, {
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

    const table = useReactTable({
        data,
        columns: columns(adminUser, changeRoleMember),
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