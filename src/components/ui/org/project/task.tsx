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
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/src/components/ui/shadcn/sheet"
import { Label } from "@/src/components/ui/shadcn/label"
import { ChevronDownIcon } from "lucide-react"
import { Calendar } from "@/src/components/ui/shadcn/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/src/components/ui/shadcn/popover"

export type Task = {
    id: string
    title: string
    description: string | null
    projectId: string
    assignedTo: string | null
    deadline: Date | null
    status: "stopped" | "assigned" | "unassigned" | "inProgress" | "completed"
    createdAt: Date
    updatedAt: Date
}

export const columns: ColumnDef<Task>[] = [
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
            <div className="capitalize">{
                row.getValue("status") === "stopped" ? "Arreté" :
                    row.getValue("status") === "assigned" ? "Assigné" :
                        row.getValue("status") === "unassigned" ? "Non assigné" :
                            row.getValue("status") === "inProgress" ? "En cours" :
                                row.getValue("status") === "completed" ? "Terminé" : ""
            }</div>
        ),
    },
    {
        accessorKey: "title",
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
        cell: ({ row }) => <div className="lowercase">{row.getValue("title")}</div>,
    },
    {
        accessorKey: "description",
        header: () => <div className="text-left">Description</div>,
        cell: ({ row }) => <div className="lowercase">{row.getValue("description")}</div>,
    },
]

export function TasksTable({ organizationSlug, projectSlug }: { organizationSlug: string, projectSlug: string }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    )
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({})
    const [data, setData] = React.useState<Task[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    React.useEffect(() => {

        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/org/${organizationSlug}/project/${projectSlug}/get-tasks`);
                const tasks = await response.json();
                setData(tasks);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [organizationSlug, projectSlug]);

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
            <div className="flex items-center py-4 justify-between">
                <Input
                    placeholder="Filtrer par nom..."
                    value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("title")?.setFilterValue(event.target.value)
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
                    <Button
                        variant="outline"
                        className="border-l-0 rounded-l-none"
                        asChild
                    >
                        <Link href={`/dashboard/new/${organizationSlug}`}>
                            <Plus className="mr-2 h-4 w-4" />
                            Nouvelle tâche
                        </Link>

                    </Button>
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
                                    <Sheet key={row.id}>
                                        <SheetTrigger asChild>
                                            <TableRow
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
                                        </SheetTrigger>
                                        <SheetContent>
                                            <SheetHeader>
                                                <SheetTitle>{row.original.title}</SheetTitle>
                                                <SheetDescription>
                                                    {row.original.description}
                                                </SheetDescription>
                                            </SheetHeader>
                                            <div className="grid flex-1 auto-rows-min gap-6 px-4">
                                                <div className="grid gap-3">
                                                    <div className="flex flex-col gap-3">
                                                        <Label htmlFor="date" className="px-1">
                                                            Date de fin
                                                        </Label>
                                                        <Popover open={open} onOpenChange={setOpen}>
                                                            <PopoverTrigger asChild>
                                                                <Button
                                                                    variant="outline"
                                                                    id="date"
                                                                    className="justify-between font-normal"
                                                                >
                                                                    {date ? date.toLocaleDateString() : "Selectionner la date de fin"}
                                                                    <ChevronDownIcon />
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                                <Calendar
                                                                    mode="single"
                                                                    selected={date}
                                                                    captionLayout="dropdown"
                                                                    onSelect={(date) => {
                                                                        setDate(date)
                                                                        setOpen(false)
                                                                    }}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </div>
                                                </div>
                                            </div>
                                            <SheetFooter>
                                                <Button type="submit">Sauvegarder</Button>
                                                <SheetClose asChild>
                                                    <Button variant="outline">Fermer</Button>
                                                </SheetClose>
                                            </SheetFooter>
                                        </SheetContent>
                                    </Sheet>

                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        Aucune tâche.
                                    </TableCell>
                                </TableRow>
                            )
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    Récupération des tâches...
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
