"use client";

import * as React from "react";
import {
  ColumnDef,
  SortingState,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Movement {
  date: string;
  value: number;
  movement: string;
  description: string;
}

interface InvestmentGeral {
  name: string;
  description: string;
  updatedValue: number;
  broker: string;
  income_name: string;
}

interface InvestmentTablesProps {
  movements: Movement[];
  investmentsGeral: InvestmentGeral[];
}

function DataTable<T>({ data, columns }: { data: T[]; columns: ColumnDef<T>[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <div className="overflow-auto">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center">
                Nenhum dado encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

const movementColumns: ColumnDef<Movement>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Data <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.getValue("date")}</div>
    ),
  },
  {
    accessorKey: "value",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Valor (R$) <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">R$ {(row.getValue("value") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "movement",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Movimento <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className={`font-bold ${row.getValue("movement") === "Aporte / Compra" ? "text-green-500" : "text-red-500"}`}>
        {row.getValue("movement") as string}
      </div>
    ),
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Descrição <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("description") as string}</div>,
  },
];

const investmentColumns: ColumnDef<InvestmentGeral>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Tipo de Investimento <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("name") as string}</div>,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Investimento <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("description") as string}</div>,
  },
  {
    accessorKey: "updatedValue",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Valor Total (R$) <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="text-right">R$ {(row.getValue("updatedValue") as number).toFixed(2)}</div>
    ),
  },
  {
    accessorKey: "broker",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Corretora <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("broker") as string}</div>,
  },
  {
    accessorKey: "income_name",
    header: ({ column }) => (
      <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
        Renda <ArrowUpDown />
      </Button>
    ),
    cell: ({ row }) => <div>{row.getValue("income_name") as string}</div>,
  },
];

export function InvestmentTables({ movements, investmentsGeral }: InvestmentTablesProps) {
  return (
    <Tabs defaultValue="movements" className="space-y-4">
      <TabsList>
        <TabsTrigger value="investments">Visão Geral</TabsTrigger>
        <TabsTrigger value="movements">Movimentações</TabsTrigger>
      </TabsList>
      <TabsContent value="movements">
        <DataTable data={movements} columns={movementColumns} />
      </TabsContent>
      <TabsContent value="investments">
        <DataTable data={investmentsGeral} columns={investmentColumns} />
      </TabsContent>
    </Tabs>
  );
}