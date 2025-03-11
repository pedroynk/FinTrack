import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvestmentTablesProps {
    movements: { date: string; value: number; movement: string; description: string }[];
    investmentsGeral: { name: string; description: string; updatedValue: number; broker: string; income_name: string }[];
}

export function InvestmentTables({ movements, investmentsGeral }: InvestmentTablesProps) {
    return (
        <div className="p-4 bg-white shadow rounded-lg overflow-auto">
            {/* Tabela de Movimentações */}
            <div className="bg-white shadow rounded-lg p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-sm">Data</TableHead>
                            <TableHead className="text-sm">Valor (R$)</TableHead>
                            <TableHead className="text-sm">Movimento</TableHead>
                            <TableHead className="text-sm">Descrição</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                        {movements.length > 0 ? (
                            movements.map((mov, index) => (
                                <TableRow key={index} className="border-b">
                                    <TableCell className="p-2">{mov.date}</TableCell>
                                    <TableCell className="p-2">R$ {mov.value.toFixed(2)}</TableCell>
                                    <TableCell className={`p-2 font-bold ${mov.movement === "Aporte / Compra" ? "text-green-600" : "text-red-600"}`}>{mov.movement}</TableCell>
                                    <TableCell className="p-2">{mov.description}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="p-2 text-center" colSpan={4}>
                                    Nenhuma movimentação encontrada.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Tabela de Investimentos */}
            <div className="bg-white shadow rounded-lg p-4">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-sm">Tipo de Investimento</TableHead>
                            <TableHead className="text-sm">Investimento</TableHead>
                            <TableHead className="text-sm">Valor Total (R$)</TableHead>
                            <TableHead className="text-sm">Corretora</TableHead>
                            <TableHead className="text-sm">Renda</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                        {investmentsGeral.length > 0 ? (
                            investmentsGeral.map((inv, index) => (
                                <TableRow key={index} className="border-b">
                                    <TableCell className="p-2">{inv.name}</TableCell>
                                    <TableCell className="p-2">{inv.description}</TableCell>
                                    <TableCell className="p-2">R$ {inv.updatedValue.toFixed(2)}</TableCell>
                                    <TableCell className="p-2">{inv.broker}</TableCell>
                                    <TableCell className="p-2">{inv.income_name}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="p-2 text-center" colSpan={5}>
                                    Nenhum investimento encontrado.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
