import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useState } from "react";

interface TransactionTableProps {
    transactions: any[];
    totalPages: number;
}

export function DashboardTable({ transactions, totalPages }: TransactionTableProps) {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const sortedTransactions = [...transactions].sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB - dateA !== 0) return dateB - dateA;
        const natureA = a.nature?.name?.toLowerCase() || '';
        const natureB = b.nature?.name?.toLowerCase() || '';
        if (natureA < natureB) return -1;
        if (natureA > natureB) return 1;
        return b.value - a.value;
    });

    return (
        <div className="p-4 bg-white shadow rounded-lg overflow-auto">
            <div className="w-full">
                <Table>
                    <TableHeader className="text-sm">
                        <TableRow>
                            <TableHead className="text-sm">Data</TableHead>
                            <TableHead className="text-sm">Tipo</TableHead>
                            <TableHead className="text-sm">Classe</TableHead>
                            <TableHead className="text-sm">Valor</TableHead>
                            <TableHead className="text-sm">Descrição</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                        {sortedTransactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                                <TableCell>{transaction.date}</TableCell>
                                <TableCell>{transaction.nature?.name || "Sem Tipo"}</TableCell>
                                <TableCell>{transaction.class?.name || "Sem Classe"}</TableCell>
                                <TableCell>R${transaction.value?.toFixed(2)}</TableCell>
                                <TableCell>{transaction.description || "Sem Descrição"}</TableCell>
                            </TableRow> 
                        ))}
                    </TableBody>
                </Table>

                {/* Paginação */}
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 bg-[#FACD19] rounded disabled:opacity-50"
                    >
                        Anterior
                    </button>
                    <span>Página {currentPage} de {totalPages}</span>
                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 bg-[#FACD19] rounded disabled:opacity-50"
                    >
                        Próxima
                    </button>
                </div>
            </div>
        </div>
    );
}