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
import { ArrowUpDown, ChevronDown, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/src/components/ui/shadcn/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/src/components/ui/shadcn/dropdown-menu"
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
import Link from "next/link"
import { MemberRole } from "@prisma/client"
import { Spinner } from "../../shadcn/spinner"

export type Project = {
    id: string
    name: string
    status: "TODO" | "isProgress" | "done"
    slug: string
    description: string
    startDate: Date | null
    dueDate: Date | null
    createdAt: Date
    updatedAt: Date
}

export const columns: ColumnDef<Project>[] = [
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="capitalize">{
                row.getValue("status") === "TODO" ? "À faire" :
                    row.getValue("status") === "isProgress" ? "En cours" :
                        row.getValue("status") === "done" ? "Terminé" : ""
            }</div>
        ),
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
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("description")}</div>,
    },
]

export function ProjectTable({ organizationSlug }: { organizationSlug: string }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [data, setData] = React.useState<Project[]>([])
    const [loading, setLoading] = React.useState(true)
    const router = useRouter();
    const [authorized, setAuthorized] = React.useState(false);
    const [loadingAuth, setLoadingAuth] = React.useState(true);

    React.useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/org/${organizationSlug}/get-org-project`);
                const projects = await response.json();
                setData(projects);
            } catch (error) {
                console.error('Error fetching projects:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        const checkAuthorization = async () => {
            try {
                setLoadingAuth(true);
                const response = await fetch(`/api/org/${organizationSlug}/get-org-user`);
                if (response.ok) {
                    const user = await response.json();
                    if (user.role === MemberRole.OWNER || user.role === MemberRole.ADMIN) {
                        setAuthorized(true);
                    } else if (user.role === MemberRole.MEMBER || user.role === MemberRole.VIEWER) {
                        setAuthorized(false);
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

    }, [organizationSlug])

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
        },
    })

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row items-center py-4 justify-between gap-4">
                <Input
                    placeholder="Filtrer par nom..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="w-full sm:max-w-sm"
                />
                <div className="w-full flex justify-end">
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
                        <Button
                            variant={"outline"}
                            disabled={!authorized}
                        >
                            <Link className="flex items-center" href={`/dashboard/new/${organizationSlug}`}>
                                {loadingAuth ? (
                                    <Spinner className="mr-2 h-4 w-4" />
                                ) : (
                                    <Plus className="mr-2 h-4 w-4" />
                                )}
                                Nouveau projet
                            </Link>

                        </Button>
                    </ButtonGroup>
                </div>
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
                                        className="hover:cursor-pointer"
                                        onClick={() => router.push(`/dashboard/org/${organizationSlug}/project/${row.original.slug}`)}
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
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Aucun projets.
                                    </TableCell>
                                </TableRow>
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Récupération des projets...
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
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
