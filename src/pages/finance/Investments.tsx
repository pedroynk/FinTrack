import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/DatePicker";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function Investments() {

    const [investments, setInvestments] = useState<any[]>([]);
    const [natures, setNatures] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [brokers, setBrokers] = useState<any[]>([]);
    const [incomes, setIncomes] = useState<any[]>([]);
    const [open, setOpen] = useState(false);
    const [openType, setOpenType] = useState(false);
    const [lineChartData, setLineChartData] = useState<Record<string, any>[]>([]);
    const [investmentNames, setInvestmentNames] = useState<string[]>([]);
    const [openRentability, setOpenRentability] = useState(false);
    const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);
    const [incomeChartData, setIncomeChartData] = useState<{ name: string; value: number }[]>([]);
    const [movements, setMovements] = useState<{ date: string; value: number; movement: string; description: string; }[]>([]);
    const COLORS = ["#FACD19", "#00C49F", "#FFBB28", "#FF8042", "#D32F2F", "#7B1FA2"];
    const generateColor = (index: number) => {
        const colors = ["#FACD19", "#00C49F", "#FFBB28", "#FF8042", "#D32F2F", "#7B1FA2", "#FF69B4", "#A569BD"];
        return colors[index % colors.length];
    };
    const [newRentability, setNewRentability] = useState({
        rentability: "",
        investment_name: "",
        date: new Date(),
    });
    const [newType, setNewType] = useState({
        income_id: "",
        name: "",
        value_yield: "",
        base_yield: "",
        description: "",
    });
    const [newInvestment, setNewInvestment] = useState({
        type_id: "",
        broker_id: "",
        income_id: "",
        nature_id: "",
        value: "",
        date: new Date(),
        description: "",
    });
    const [investmentsGeral, setInvestmentsGeral] = useState<{
        description: string;
        totalValue: number;
        broker: string;
    }[]>([]);

    useEffect(() => {
        fetchInvestments();
        fetchTypes();
        fetchBrokers();
        fetchNatures();
        fetchIncomes();
        fetchInvestmentDistribution();
        fetchIncomeDistribution();
        fetchRentabilityOverTime();
        fetchMovements();
        fetchInvestmentSummary();
    }, []);

    const fetchInvestments = async () => {
        const { data, error } = await supabase
            .from("investment_movement")
            .select("*");

        if (error) {
            console.error("Erro ao buscar investimentos:", error.message);
        } else {
            setInvestments(data || []);
        }
    };


    const fetchTypes = async () => {
        const { data, error } = await supabase.from("investment_type").select("*");
        if (error) console.error("Erro ao buscar tipos de investimento:", error.message);
        setTypes(data || []);
    };

    const fetchBrokers = async () => {
        const { data, error } = await supabase.from("broker").select("*");
        if (error) console.error("Erro ao buscar corretoras:", error.message);
        setBrokers(data || []);
    };

    const fetchNatures = async () => {
        const { data, error } = await supabase.from("investment_nature").select("*");
        if (error) console.error("Erro ao buscar Naturezas.:", error.message);
        setNatures(data || []);
    };

    const fetchIncomes = async () => {
        const { data, error } = await supabase.from("investment_income").select("*");
        if (error) console.error("Erro ao buscar tipos de renda:", error.message);
        setIncomes(data || []);
    };

    async function createInvestment() {
        const { error } = await supabase.from("investment_movement").insert([
            {
                ...newInvestment,
                value: parseFloat(newInvestment.value),
            },
        ]);

        if (error) {
            toast({
                title: "Erro",
                description: `Falha ao adicionar Investimento: ${error.message}`,
                variant: "destructive",
                duration: 2000,
            });
        } else {
            toast({
                title: "Sucesso",
                description: "Investimento adicionado com sucesso!",
                duration: 2000,
            });
            fetchInvestments();
            setOpen(false);
        }
    }

    async function createType() {
        const { error } = await supabase.from("investment_type").insert([
            {
                ...newType,
                value_yield: parseFloat(newType.value_yield),
            },
        ]);

        if (error) {
            toast({
                title: "Erro",
                description: `Falha ao adicionar Tipo de Investimento: ${error.message}`,
                variant: "destructive",
                duration: 2000,
            });
        } else {
            toast({
                title: "Sucesso",
                description: "Tipo de Investimento adicionado com sucesso!",
                duration: 2000,
            });
            fetchTypes();
            setOpenType(false);
        }
    }

    async function createRentability() {
        const { error } = await supabase.from("investment_rentability").insert([
            {
                ...newRentability,
                rentability: parseFloat(newRentability.rentability),
            },
        ]);

        if (error) {
            toast({
                title: "Erro",
                description: `Falha ao adicionar Rentabilidade do Investimento: ${error.message}`,
                variant: "destructive",
                duration: 2000,
            });
        } else {
            toast({
                title: "Sucesso",
                description: "Rentabilidade do Investimento adicionado com sucesso!",
                duration: 2000,
            });
            fetchTypes();
            setOpenRentability(false);

        }
    }

    async function fetchInvestmentDistribution() {
        const { data: investments, error: invError } = await supabase
            .from("investment_movement")
            .select("type_id, value, nature_id");

        if (invError) {
            console.error("Erro ao buscar investimentos:", invError.message);
            return;
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, name");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }

        const typeMap = investmentTypes.reduce((acc, type) => {
            acc[type.id] = type.name;
            return acc;
        }, {} as Record<number, string>);

        const groupedData = investments.reduce<Record<number, { name: string; value: number }>>((acc, item) => {
            const type = item.type_id;
            const value = item.nature_id === 1 ? item.value : -item.value;

            if (!acc[type]) {
                acc[type] = { name: typeMap[type] || `Tipo ${type}`, value: 0 };
            }
            acc[type].value += value;
            return acc;
        }, {});

        const totalInvested = Object.values(groupedData).reduce((sum, item) => sum + item.value, 0);

        const percentageData = Object.values(groupedData).map(item => ({
            name: item.name,
            value: parseFloat(((item.value / totalInvested) * 100).toFixed(2)),
        }));

        setPieChartData(percentageData);
    }

    async function fetchIncomeDistribution() {
        const { data, error } = await supabase
            .from("investment_movement")
            .select("income_id, value, nature_id");

        if (error) {
            console.error("Erro ao buscar distribuição de renda:", error.message);
            return;
        }

        const incomeData = data.reduce<Record<string, number>>((acc, item) => {
            const incomeType = item.income_id === 1 ? "Renda Passiva" : "Renda Variável";
            const value = item.nature_id === 1 ? item.value : -item.value;

            if (!acc[incomeType]) {
                acc[incomeType] = 0;
            }
            acc[incomeType] += value;
            return acc;
        }, {});

        const totalIncome = Object.values(incomeData).reduce((sum, item) => sum + item, 0);

        const percentageData = Object.keys(incomeData).map((key) => ({
            name: key,
            value: parseFloat(((incomeData[key] / totalIncome) * 100).toFixed(2)), // 🔹 Transformando em porcentagem
        }));

        setIncomeChartData(percentageData);
    }

    async function fetchRentabilityOverTime() {
        const { data, error } = await supabase
            .from("investment_rentability")
            .select("investment_name, rentability, date");

        if (error) {
            console.error("Erro ao buscar rentabilidade por tempo:", error.message);
        } else {
            const formattedData = data.map(item => ({
                month: new Date(item.date).toLocaleString("pt-BR", { month: "short", year: "numeric" }),
                investment: item.investment_name,
                rentability: item.rentability,
            }));

            const groupedData = formattedData.reduce<Record<string, any>[]>((acc, item) => {
                let existing = acc.find(d => d.month === item.month);

                if (!existing) {
                    existing = { month: item.month };
                    acc.push(existing);
                }

                existing[item.investment] = item.rentability;

                return acc;
            }, []);

            const uniqueInvestments = [...new Set(data.map(item => item.investment_name))];

            setLineChartData(groupedData);
            setInvestmentNames(uniqueInvestments);
        }
    }

    async function fetchMovements() {
        // 🔹 1. Buscar movimentos de investimento
        const { data, error } = await supabase
            .from("investment_movement")
            .select("date, value, nature_id, type_id");

        if (error) {
            console.error("Erro ao buscar movimentações:", error.message);
            return;
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, description");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }

        const investmentTypeMap = investmentTypes.reduce((acc, type) => {
            acc[type.id] = type.description;
            return acc;
        }, {} as Record<number, string>);

        const formattedData = data.map(item => ({
            date: new Date(item.date).toLocaleDateString("pt-BR"),
            value: parseFloat(item.value.toFixed(2)),
            movement: item.nature_id === 1 ? "Aporte / Compra" : "Saque / Venda",
            description: investmentTypeMap[item.type_id] || "Sem descrição",
        }));

        setMovements(formattedData);
    }




    async function fetchInvestmentSummary() {
        const { data, error } = await supabase
            .from("investment_movement")
            .select("type_id, value, broker_id, nature_id");

        if (error) {
            console.error("Erro ao buscar investimentos:", error.message);
            return;
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, name");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }

        const { data: brokers, error: brokerError } = await supabase
            .from("broker")
            .select("id, name");

        if (brokerError) {
            console.error("Erro ao buscar corretoras:", brokerError.message);
            return;
        }

        const brokerMap = brokers.reduce((acc, broker) => {
            acc[broker.id] = broker.name;
            return acc;
        }, {} as Record<number, string>);

        const investmentTypeMap = investmentTypes.reduce((acc, type) => {
            acc[type.id] = type.name;
            return acc;
        }, {} as Record<number, string>);

        const groupedInvestments = data.reduce<Record<string, { description: string; totalValue: number; broker: string }>>((acc, item) => {
            const investmentName = investmentTypeMap[item.type_id] || "Desconhecido";
            const brokerName = brokerMap[item.broker_id] || "Sem corretora";
            const key = `${investmentName}-${brokerName}`;

            const adjustedValue = item.nature_id === 1 ? item.value : -item.value;

            if (!acc[key]) {
                acc[key] = { description: investmentName, totalValue: 0, broker: brokerName };
            }
            acc[key].totalValue += adjustedValue;

            return acc;
        }, {});

        setInvestmentsGeral(Object.values(groupedInvestments));
    }


    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Investimentos</h1>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Adicionar Investimento</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Novo Investimento</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                        <Label>Data</Label>
                        <DatePicker
                            selectedDate={newInvestment.date}
                            onSelect={(date) =>
                                setNewInvestment({ ...newInvestment, date: date ?? new Date() })
                            }
                        />

                        <Label>Movimento</Label>
                        <Select
                            onValueChange={(value) =>
                                setNewInvestment({ ...newInvestment, nature_id: value })
                            }
                            value={newInvestment.nature_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Movimento" />
                            </SelectTrigger>
                            <SelectContent>
                                {natures.length > 0 ? (
                                    natures.map((n) => (
                                        <SelectItem key={n.id} value={n.id.toString()}>
                                            {n.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhum Movimento Encontrado.
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        <Label>Valor</Label>
                        <Input
                            type="number"
                            min="1"
                            value={newInvestment.value}
                            onChange={(e) =>
                                setNewInvestment({ ...newInvestment, value: e.target.value })
                            }
                        />

                        <Label>Investimento</Label>
                        <Select
                            onValueChange={(value) =>
                                setNewInvestment({ ...newInvestment, type_id: value })
                            }
                            value={newInvestment.type_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.length > 0 ? (
                                    types.map((t) => (
                                        <SelectItem key={t.id} value={t.id.toString()}>
                                            {t.description}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhum tipo encontrado
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        <Label>Corretora</Label>
                        <Select
                            onValueChange={(value) =>
                                setNewInvestment({ ...newInvestment, broker_id: value })
                            }
                            value={newInvestment.broker_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione a Corretora" />
                            </SelectTrigger>
                            <SelectContent>
                                {brokers.length > 0 ? (
                                    brokers.map((b) => (
                                        <SelectItem key={b.id} value={b.id.toString()}>
                                            {b.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhuma corretora encontrada
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>

                        <Button onClick={createInvestment}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Dialog para adicionar tipo de investimento */}
            <Dialog open={openType} onOpenChange={setOpenType}>
                <DialogTrigger asChild>
                    <Button>Adicionar Tipo de Investimento</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Novo Tipo de Investimento</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                        <Label>Tipo de Investimento</Label>
                        <Input
                            type="text"
                            value={newType.name}
                            onChange={(e) =>
                                setNewType({ ...newType, name: e.target.value })
                            }
                        />
                        <Label>Descrição</Label>
                        <Input
                            type="text"
                            value={newType.description}
                            onChange={(e) =>
                                setNewType({ ...newType, description: e.target.value })
                            }
                        />
                        <Label>Tipo de Renda</Label>
                        <Select
                            onValueChange={(value) =>
                                setNewType({ ...newType, income_id: value })
                            }
                            value={newType.income_id}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Tipo de Renda" />
                            </SelectTrigger>
                            <SelectContent>
                                {incomes.length > 0 ? (
                                    incomes.map((i) => (
                                        <SelectItem key={i.id} value={i.id.toString()}>
                                            {i.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhum tipo de renda encontrado
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Label>Rendimento (%) / Dividendo (R$) </Label>
                        <Input
                            type="number"
                            min="1"
                            value={newType.value_yield}
                            onChange={(e) =>
                                setNewType({ ...newType, value_yield: e.target.value })
                            }
                        />

                        <Label>Base de Retorno</Label>
                        <Input
                            type="text"
                            value={newType.base_yield}
                            onChange={(e) =>
                                setNewType({ ...newType, base_yield: e.target.value })
                            }
                        />

                        <Button onClick={createType}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={openRentability} onOpenChange={setOpenRentability}>
                <DialogTrigger asChild>
                    <Button>Adicionar Rentabilidade</Button>
                </DialogTrigger>
                <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
                    <DialogHeader>
                        <DialogTitle>Cadastrar Rentabilidade</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                        <Label>Investimento</Label>
                        <Input
                            type="text"
                            value={newRentability.investment_name}
                            onChange={(e) =>
                                setNewRentability({ ...newRentability, investment_name: e.target.value })
                            }
                        />
                        <Label>Rentabilidade</Label>
                        <Input
                            type="number"
                            min="1"
                            value={newRentability.rentability}
                            onChange={(e) =>
                                setNewRentability({ ...newRentability, rentability: e.target.value })
                            }
                        />
                        <DatePicker
                            selectedDate={newRentability.date}
                            onSelect={(date) =>
                                setNewRentability({ ...newRentability, date: date ?? new Date() })
                            }
                        />
                        <Button onClick={createRentability}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
            <div className="p-4 bg-white shadow rounded-lg">
                <PieChart width={450} height={350}>
                    <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={50}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                        {pieChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
                <h1></h1>
                <PieChart width={450} height={350}>
                    <Pie
                        data={incomeChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={110}
                        innerRadius={50}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        isAnimationActive={true}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                    >
                        {incomeChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} stroke="#fff" strokeWidth={2} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                    <Legend verticalAlign="bottom" height={36} />
                </PieChart>
                <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={lineChartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        {investmentNames.map((name, index) => (
                            <Line
                                key={index}
                                type="monotone"
                                dataKey={name}
                                stroke={generateColor(index)}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                                activeDot={{ r: 6 }}
                            />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
                <Table className="w-full border rounded-lg">
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            <TableHead className="p-2 text-left">Data</TableHead>
                            <TableHead className="p-2 text-left">Valor (R$)</TableHead>
                            <TableHead className="p-2 text-left">Movimento</TableHead>
                            <TableHead className="p-2 text-left">Descrição</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {movements.length > 0 ? (
                            movements.map((mov, index) => (
                                <TableRow key={index} className="border-b">
                                    <TableCell className="p-2">{mov.date}</TableCell>
                                    <TableCell className="p-2">R$ {mov.value.toFixed(2)}</TableCell>
                                    <TableCell
                                        className={`p-2 font-bold ${mov.movement === "Aporte / Compra" ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {mov.movement}
                                    </TableCell>
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

                <Table className="w-full border rounded-lg">
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            <TableHead className="p-2 text-left">Investimento</TableHead>
                            <TableHead className="p-2 text-left">Valor Total (R$)</TableHead>
                            <TableHead className="p-2 text-left">Corretora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {investmentsGeral.length > 0 ? (
                            investmentsGeral.map((inv, index) => (
                                <TableRow key={index} className="border-b">
                                    <TableCell className="p-2">{inv.description}</TableCell>
                                    <TableCell className="p-2">
                                        R$ {inv.totalValue.toFixed(2)}
                                    </TableCell>
                                    <TableCell className="p-2">{inv.broker}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell className="p-2 text-center" colSpan={3}>
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