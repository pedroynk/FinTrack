"use client";

import * as React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Table as TanstackTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Transaction {
    id: string;
    date: string;
    nature?: { name: string };
    class?: { name: string };
    value: number;
    description?: string;
}

interface DashboardTableProps {
    transactions: Transaction[];
}

export const columns: ColumnDef<Transaction>[] = [
    {
        id: "select",
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "date",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Data
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
    },
    {
        accessorKey: "nature.name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Tipo
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }: { row: any }) => row.original.nature?.name || "Sem Tipo",
    },
    {
        accessorKey: "class.name",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Classe
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }: { row: any }) => row.original.class?.name || "Sem Classe",
    },
    {
        accessorKey: "value",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Valor
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }: { row: any }) => `R$ ${row.original.value.toFixed(2)}`,
    },
    {
        accessorKey: "description",
        header: "Descrição",
        cell: ({ row }: { row: any }) => row.original.description || "Sem Descrição",
    },
];

export function DashboardTable({ transactions }: DashboardTableProps) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        []
    );

    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    const table = useReactTable({
        data: transactions,
        columns,
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
    });
    const maxPageNumbers = 5;
    const totalPages = React.useMemo(() => table.getPageCount(), [table]);
    const currentPage = React.useMemo(() => table.getState().pagination.pageIndex, [table]);
    const startPage = Math.max(0, Math.min(currentPage - 2, totalPages - maxPageNumbers));
    const endPage = Math.min(totalPages, startPage + maxPageNumbers);

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filtrar por descrição..."
                    value={(table.getColumn("description")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("description")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Colunas <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
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
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Nenhuma transação encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                href="#"
                                className={table.getCanPreviousPage() ? "" : "opacity-50 pointer-events-none"}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (table.getCanPreviousPage()) table.previousPage();
                                }}
                            />
                        </PaginationItem>
                        {startPage > 0 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                        {Array.from({ length: endPage - startPage }, (_, index) => (
                            <PaginationItem key={startPage + index}>
                                <PaginationLink
                                    href="#"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        table.setPageIndex(startPage + index);
                                    }}
                                    isActive={currentPage === startPage + index}
                                >
                                    {startPage + index + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                        {endPage < totalPages && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                        <PaginationItem>
                            <PaginationNext
                                href="#"
                                className={table.getCanNextPage() ? "" : "opacity-50 pointer-events-none"}
                                onClick={(event) => {
                                    event.preventDefault();
                                    if (table.getCanNextPage()) table.nextPage();
                                }}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
