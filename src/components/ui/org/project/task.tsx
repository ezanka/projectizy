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
import { Archive, ArrowUpDown, Check, ChevronDown, Eye, ListChecks, ListRestart, PackageOpen, Pin, Plus, RefreshCw, User, UserCheck, X } from "lucide-react"

import { Button } from "@/src/components/ui/shadcn/button"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
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
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/src/components/ui/shadcn/tooltip"
import Link from "next/link"
import useSWR from "swr";
import { Task, TaskPriority, TaskStatus, TaskType } from "@prisma/client";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/shadcn/select"
import { Checkbox } from "@/src/components/ui/shadcn/checkbox"
import { User as UserType } from "@prisma/client"
import { toast } from "sonner"

export function TasksTable({ organizationSlug, projectSlug, user }: { organizationSlug: string, projectSlug: string, user: UserType | null }) {
    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnFiltersMe, setColumnFiltersMe] = React.useState<boolean>(false)
    const [columnFiltersArchived, setColumnFiltersArchived] = React.useState<boolean>(false)
    const [columnFiltersStatus, setColumnFiltersStatus] = React.useState<TaskStatus[]>([])
    const [columnFiltersStatusOpen, setColumnFiltersStatusOpen] = React.useState<boolean>(false)
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [data, setData] = React.useState<Task[]>([])
    const [loading, setLoading] = React.useState(true)
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(undefined)

    const [id, setId] = React.useState<string>("")
    const [title, setTitle] = React.useState<string>("")
    const [status, setStatus] = React.useState<TaskStatus | undefined>(undefined)
    const [priority, setPriority] = React.useState<TaskPriority | undefined>(undefined)
    const [type, setType] = React.useState<TaskType | undefined>(undefined)
    const [deadline, setDeadline] = React.useState<Date | undefined>(undefined)
    const [archived, setArchived] = React.useState<boolean>(false)
    const [loadingSave, setLoadingSave] = React.useState<boolean>(false)

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        if (!title || !status || !priority || !type) return

        const payload = {
            title,
            status,
            priority,
            type,
            deadline: deadline ? deadline.toISOString() : null,
            archived,
        }

        await toast.promise(
            (async () => {
                setLoadingSave(true)
                const res = await fetch(`/api/org/${organizationSlug}/project/${projectSlug}/task/${id}/update`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                })
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}))
                    setLoadingSave(false)
                    throw new Error(data.error || "Impossible d’enregistrer la tâche.")
                }
                const updated = await res.json()

                setData((prev) =>
                    prev.map((t) =>
                        t.id === id
                            ? {
                                ...t,
                                ...updated,
                                title: payload.title,
                                status: payload.status,
                                priority: payload.priority,
                                type: payload.type,
                                deadline: payload.deadline ?? undefined,
                                archived: payload.archived,
                                updatedAt: new Date().toISOString(),
                            }
                            : t
                    )
                )
                setLoadingSave(false)
                return "Tâche mise à jour."
            })(),
            { loading: "Sauvegarde…", success: (m) => m, error: (err) => err.message }
        )
    }

    const fetcher = (url: string) => fetch(url).then((r) => r.json());

    function UseUserName(userId: string | null) {
        const { data, error, isLoading } = useSWR(
            userId ? `/api/user/${userId}/get-user` : null,
            fetcher
        );

        return {
            name: data?.name ?? (error ? "Inconnu" : undefined),
            isLoading,
        };
    }

    const columns: ColumnDef<Task>[] = [
        {
            id: "details",
            enableHiding: false,
            header: "Détails",
            cell: ({ row }) => {
                return (
                    <Link href={`/dashboard/org/${organizationSlug}/project/${projectSlug}/tasks/${row.original.id}`} className="text-muted-foreground hover:text-primary">
                        <Eye className="ml-3" />
                    </Link>

                )
            },
        },
        {
            accessorKey: "status",
            filterFn: (row, id, filterValue: TaskStatus[]) => {
                if (!filterValue || filterValue.length === 0) return true
                const value = row.getValue<TaskStatus>(id as "status")
                return filterValue.includes(value)
            },
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Statut
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => (
                <div className="capitalize ml-4">{
                    row.getValue("status") === TaskStatus.TODO ? "à faire" :
                        row.getValue("status") === TaskStatus.IN_PROGRESS ? "en cours" :
                            row.getValue("status") === TaskStatus.REVIEW ? "à vérifier" :
                                row.getValue("status") === TaskStatus.BLOCKED ? "Bloqué" :
                                    row.getValue("status") === TaskStatus.DONE ? "Terminé" :
                                        row.getValue("status") === TaskStatus.CANCELED ? "Annulé" : ""
                }</div>
            ),
        },
        {
            accessorKey: "priority",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Priorité
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="capitalize ml-4">{
                row.getValue("priority") === TaskPriority.NONE ? <div className="flex items-center gap-2"><div className="w-2 h-2 border rounded-full"></div>Aucune</div> :
                    row.getValue("priority") === TaskPriority.LOW ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-blue-300 rounded-full"></div>Basse</div> :
                        row.getValue("priority") === TaskPriority.MEDIUM ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-orange-400 rounded-full"></div>Moyenne</div> :
                            row.getValue("priority") === TaskPriority.HIGH ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-400 rounded-full"></div>Haute</div> :
                                row.getValue("priority") === TaskPriority.URGENT ? <div className="flex items-center gap-2"><div className="w-2 h-2 bg-red-700 rounded-full"></div>Urgent</div> : ""
            }</div>,
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
            cell: ({ row }) => <div className="capitalize ml-4">{row.getValue("title")}</div>,
        },
        {
            accessorKey: "assignedTo",
            header: "Assigné à",
            cell: ({ row }) => {
                const userId = row.getValue("assignedTo") as string | null;
                const { name, isLoading } = UseUserName(userId);

                return (
                    <div className="capitalize">
                        {isLoading ? "Récupération..." : name || "Personne"}
                    </div>
                );
            },
        },
        {
            accessorKey: "deadline",
            header: () => <div className="text-left">Deadline</div>,
            cell: ({ row }) => <div className="lowercase">{row.getValue("deadline") ? new Date(row.getValue("deadline")).toLocaleDateString() : "Pas de date limite"}</div>,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Dernière mise à jour
                        <ArrowUpDown />
                    </Button>
                )
            },
            cell: ({ row }) => <div className="lowercase ml-4">{new Date(row.getValue("updatedAt")).toLocaleDateString()} - {new Date(row.getValue("updatedAt")).toLocaleTimeString()}</div>,
        },
        {
            accessorKey: "archived",
            header: () => <div className="text-left">Archivé</div>,
            cell: ({ row }) => <div className="lowercase">{row.getValue("archived") ? <Check className="text-sm text-border" /> : <X className="text-sm text-border" />}</div>,
        },
    ]

    const reFetchData = async () => {
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

    React.useEffect(() => {
        if (!columnFiltersMe) {
            table.getColumn("assignedTo")?.setFilterValue("")
        } else {
            table.getColumn("assignedTo")?.setFilterValue(user?.id)
        };

        if (columnFiltersArchived) {
            table.getColumn("archived")?.setFilterValue(true)
        } else {
            table.getColumn("archived")?.setFilterValue(false)
        };

        if (columnFiltersStatus.length === 0) {
            table.getColumn("status")?.setFilterValue(undefined)
        } else {
            table.getColumn("status")?.setFilterValue(columnFiltersStatus)
        }

        table.resetPageIndex();
    }, [columnFiltersMe, columnFiltersArchived, columnFiltersStatus, user, table]);

    React.useEffect(() => {
        table.resetPageIndex();
        table.setSorting([{ id: "updatedAt", desc: true }]);
    }, [table]);

    return (
        <div className="w-full">
            <div className="flex items-center py-4 justify-between gap-4 sm:flex-row w-full flex-col">
                <div className="flex items-center gap-2 w-full max-w-md">
                    <Input
                        placeholder="Filtrer par nom..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                    />
                    <DropdownMenu open={columnFiltersStatusOpen} onOpenChange={setColumnFiltersStatusOpen}>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Pin />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Statut</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => setColumnFiltersStatus([])}>
                                    <ListRestart />
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => setColumnFiltersStatus(Object.values(TaskStatus))}>
                                    <ListChecks />
                                </Button>
                            </div>
                            <DropdownMenuSeparator />
                            {Object.values(TaskStatus).map((s) => {
                                const label =
                                    s === TaskStatus.TODO ? "À faire" :
                                        s === TaskStatus.IN_PROGRESS ? "En cours" :
                                            s === TaskStatus.REVIEW ? "À vérifier" :
                                                s === TaskStatus.BLOCKED ? "Bloqué" :
                                                    s === TaskStatus.DONE ? "Terminé" :
                                                        s === TaskStatus.CANCELED ? "Annulé" : s

                                return (
                                    <DropdownMenuCheckboxItem
                                        key={s}
                                        className="capitalize"
                                        checked={columnFiltersStatus.includes(s)}
                                        onCheckedChange={(checked) => {
                                            setColumnFiltersStatus((prev) =>
                                                checked ? [...prev, s] : prev.filter((x) => x !== s)
                                            );
                                        }}
                                        onSelect={(e) => e.preventDefault()}
                                    >
                                        {label}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={columnFiltersMe ? "default" : "outline"} onClick={() => setColumnFiltersMe(!columnFiltersMe)} className="">
                                {columnFiltersMe ? <UserCheck /> : <User />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Mes assignations</p>
                        </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button variant={columnFiltersArchived ? "default" : "outline"} onClick={() => setColumnFiltersArchived(!columnFiltersArchived)} className="">
                                {columnFiltersArchived ? <PackageOpen /> : <Archive />}
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Archivé</p>
                        </TooltipContent>
                    </Tooltip>

                    <Button variant="outline" onClick={() => {
                        table.resetColumnFilters();
                        setColumnFiltersMe(false);
                        setColumnFiltersArchived(false);
                        setColumnFiltersStatus([]);
                        reFetchData();
                    }}>
                        <RefreshCw />
                    </Button>
                </div>
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
                        <Link href={`/dashboard/org/${organizationSlug}/project/${projectSlug}/tasks/new`}>
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
                                        <SheetTrigger asChild onClick={
                                            () => {
                                                setId(row.original.id)
                                                setTitle(row.original.title)
                                                setStatus(row.original.status)
                                                setPriority(row.original.priority)
                                                setType(row.original.type)
                                                setDeadline(row.original.deadline ? new Date(row.original.deadline) : undefined)
                                                setArchived(row.original.archived)
                                            }}>
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
                                            <form onSubmit={handleSave} className="h-full flex flex-col justify-between">
                                                <SheetHeader>
                                                    <SheetTitle>{row.original.title}</SheetTitle>
                                                    <SheetDescription>
                                                        Modification rapide
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="grid flex-1 auto-rows-min gap-6 px-4">
                                                    <div className="grid gap-3">
                                                        <div className="flex flex-col gap-3">
                                                            <Label htmlFor="title" className="px-1">
                                                                Titre
                                                            </Label>
                                                            <Input
                                                                id="title"
                                                                value={title}
                                                                onChange={(e) => setTitle(e.target.value)}
                                                                className="w-full"
                                                                disabled={loadingSave}
                                                            />
                                                            <Label htmlFor="statut" className="px-1">
                                                                Statut
                                                            </Label>
                                                            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)} disabled={loadingSave}>
                                                                <SelectTrigger id="statut" className="w-full">
                                                                    <SelectValue placeholder="Statut" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(TaskStatus).map((status) => (
                                                                        <SelectItem key={status} value={status} className="capitalize">
                                                                            {status === TaskStatus.TODO ? "À faire" :
                                                                                status === TaskStatus.IN_PROGRESS ? "En cours" :
                                                                                    status === TaskStatus.REVIEW ? "À vérifier" :
                                                                                        status === TaskStatus.BLOCKED ? "Bloqué" :
                                                                                            status === TaskStatus.DONE ? "Terminé" :
                                                                                                status === TaskStatus.CANCELED ? "Annulé" : ""}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Label htmlFor="priority" className="px-1">
                                                                Priorité
                                                            </Label>
                                                            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)} disabled={loadingSave}>
                                                                <SelectTrigger id="priority" className="w-full">
                                                                    <SelectValue placeholder="Priorité" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(TaskPriority).map((priority) => (
                                                                        <SelectItem key={priority} value={priority} className="capitalize">
                                                                            {priority === TaskPriority.NONE ? "Aucune" :
                                                                                priority === TaskPriority.LOW ? "Basse" :
                                                                                    priority === TaskPriority.MEDIUM ? "Moyenne" :
                                                                                        priority === TaskPriority.HIGH ? "Haute" :
                                                                                            priority === TaskPriority.URGENT ? "Urgent" : ""}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Label htmlFor="type" className="px-1">
                                                                Type
                                                            </Label>
                                                            <Select value={type} onValueChange={(value) => setType(value as TaskType)} disabled={loadingSave}>
                                                                <SelectTrigger id="type" className="w-full">
                                                                    <SelectValue placeholder="Type" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {Object.values(TaskType).map((type) => (
                                                                        <SelectItem key={type} value={type} className="capitalize">
                                                                            {type === TaskType.TASK ? "Tâche" :
                                                                                type === TaskType.BUG ? "Bug" :
                                                                                    type === TaskType.FEATURE ? "Fonctionnalité" :
                                                                                        type === TaskType.CHORE ? "Nettoyage" : ""}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <Label htmlFor="date" className="px-1">
                                                                Date de fin
                                                            </Label>
                                                            <Popover open={open} onOpenChange={setOpen}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        variant="outline"
                                                                        id="date"
                                                                        className="justify-between font-normal"
                                                                        disabled={loadingSave}
                                                                    >
                                                                        {deadline ? new Date(deadline).toLocaleDateString() : "Selectionner la date de fin"}
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
                                                                            setDeadline(date)
                                                                        }}
                                                                    />
                                                                </PopoverContent>
                                                            </Popover>
                                                            <Label htmlFor="archived" className="px-1">
                                                                Archivé
                                                            </Label>
                                                            <Checkbox
                                                                id="archived"
                                                                checked={archived}
                                                                onCheckedChange={(checked) => setArchived(!!checked)}
                                                                disabled={loadingSave}
                                                            />
                                                            <p className="text-muted-foreground text-xs">Les tâches archivées ne compteront plus dans la progression globale.</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <SheetFooter>
                                                    <Button type="submit" disabled={loadingSave}>{loadingSave ? "Sauvegarde en cours..." : "Sauvegarder"}</Button>
                                                    <SheetClose asChild>
                                                        <Button variant="outline" disabled={loadingSave}>Fermer</Button>
                                                    </SheetClose>
                                                </SheetFooter>
                                            </form>
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
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} - {table.getRowModel().rows.length} / {table.getCoreRowModel().rows.length} tâche{table.getCoreRowModel().rows.length > 1 ? "s" : ""} au total
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
