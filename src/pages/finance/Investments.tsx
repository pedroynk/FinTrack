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
import { Bar, BarChart, Cell, Legend, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
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
    const [openRentability, setOpenRentability] = useState(false);
    const [pieChartData, setPieChartData] = useState<{ name: string; value: number }[]>([]);
    const [barChartData, setBarChartData] = useState<{ description: string; totalRentability: number }[]>([]);
    const [incomeChartData, setIncomeChartData] = useState<{ name: string; value: number }[]>([]);
    const [totalInvested, setTotalInvested] = useState(0);
    const [totalUpdated, setTotalUpdated] = useState(0);
    const [totalGain, setTotalGain] = useState(0);
    const [movements, setMovements] = useState<{ date: string; value: number; movement: string; description: string; }[]>([]);
    const COLORS = ["#FACD19", "#00C49F", "#FFBB28", "#FF8042", "#D32F2F", "#7B1FA2"];

    const [newRentability, setNewRentability] = useState({
        type_id: "",
        initial_value: "",
        final_value: "",
        withdrawal_value: "",
        contribution_value: "",
        rentability: "",
        initial_date: new Date(),
        final_date: new Date(),
    });
    const [newType, setNewType] = useState({
        income_id: "",
        name: "",
        description: "",
    });
    const [newInvestment, setNewInvestment] = useState({
        type_id: "",
        broker_id: "",
        nature_id: "",
        value: "",
        date: new Date(),
    });
    const [investmentsGeral, setInvestmentsGeral] = useState<{
        name: string;
        income_name: string;
        description: string;
        totalValue: number;
        updatedValue: number;
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
        fetchTopInvestments();
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
        let initialValue = parseFloat(newRentability.initial_value);
        let finalValue = parseFloat(newRentability.final_value);
        let withdrawalValue = parseFloat(newRentability.withdrawal_value);
        let contributionValue = parseFloat(newRentability.contribution_value);

        if (isNaN(initialValue)) {
            initialValue = 0;
        }
        if (isNaN(finalValue)) {
            finalValue = 0;
        }
        if (isNaN(withdrawalValue)) {
            withdrawalValue = 0;
        }
        if (isNaN(contributionValue)) {
            contributionValue = 0;
        }

        if (initialValue === 0 || finalValue === 0) {
            toast({
                title: "Erro",
                description: "Os valores iniciais e finais são obrigatórios.",
                variant: "destructive",
                duration: 2000,
            });
            return;
        }

        let adjustedInitialValue = initialValue;
        if (contributionValue !== 0 || withdrawalValue !== 0) {
            adjustedInitialValue = initialValue + contributionValue - withdrawalValue;
        }

        const rentability = ((finalValue - adjustedInitialValue) / adjustedInitialValue) * 100;
        const { error } = await supabase.from("investment_rentability").insert([
            {
                ...newRentability,
                rentability: rentability,
                initial_value: initialValue,
                final_value: finalValue,
                withdrawal_value: withdrawalValue,
                contribution_value: contributionValue,
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
                description: "Rentabilidade do Investimento adicionada com sucesso!",
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
        const { data: movements, error } = await supabase
            .from("investment_movement")
            .select("type_id, value, nature_id");

        if (error) {
            console.error("Erro ao buscar distribuição de renda:", error.message);
            return;
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, income_id");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }

        const { data: incomeTypes, error: incomeError } = await supabase
            .from("investment_income")
            .select("id, name");

        if (incomeError) {
            console.error("Erro ao buscar nomes de renda:", incomeError.message);
            return;
        }

        const investmentTypeMap = investmentTypes.reduce((acc, type) => {
            acc[type.id] = type.income_id;
            return acc;
        }, {} as Record<number, number>);

        const incomeTypeMap = incomeTypes.reduce((acc, income) => {
            acc[income.id] = income.name;
            return acc;
        }, {} as Record<number, string>);

        const incomeData = movements.reduce<Record<string, number>>((acc, item) => {
            const incomeId = investmentTypeMap[item.type_id] || 0;
            const incomeType = incomeTypeMap[incomeId] || "Desconhecido";
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
            value: parseFloat(((incomeData[key] / totalIncome) * 100).toFixed(2)),
        }));
        setIncomeChartData(percentageData);
    }

    async function fetchRentabilityOverTime() {
        const { data, error } = await supabase
            .from("investment_rentability")
            .select("rentability, initial_date, final_date");
        if (error) {
            console.error("Erro ao buscar rentabilidade por tempo:", error.message);
            return;
        }
        const groupedData: { month: string; totalRentability: number }[] = [];
        data.forEach(item => {
            const startDate = new Date(item.initial_date);
            const endDate = new Date(item.final_date);
            if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
                console.error("Data inválida encontrada:", item);
                return;
            }
            const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);

            let current = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);
            while (current <= endDate) {
                const monthKey = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`;
                if (current < startDate || current > endDate) {
                    current.setMonth(current.getMonth() + 1);
                    continue;
                }
                const monthStart = new Date(current.getUTCFullYear(), current.getUTCMonth(), 1);
                const monthEnd = new Date(current.getUTCFullYear(), current.getUTCMonth() + 1, 0);
                const start = Math.max(monthStart.getTime(), startDate.getTime());
                const end = Math.min(monthEnd.getTime(), endDate.getTime());
                const daysInMonthCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                const monthRentability = (daysInMonthCount / totalDays) * item.rentability;
                let existing = groupedData.find(d => d.month === monthKey);
                if (!existing) {
                    existing = { month: monthKey, totalRentability: 0 };
                    groupedData.push(existing);
                }
                existing.totalRentability += monthRentability;
                current.setMonth(current.getMonth() + 1);
            }
        });
        const validMonths = new Set(data.map(item => {
            return `${new Date(item.initial_date).getUTCFullYear()}-${String(new Date(item.initial_date).getUTCMonth() + 1).padStart(2, '0')}`;
        }));
        const filteredGroupedData = groupedData.filter(d => validMonths.has(d.month));
        setLineChartData(filteredGroupedData);
    }

    async function fetchMovements() {
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
        const { data: movements, error } = await supabase
            .from("investment_movement")
            .select("type_id, value, broker_id, nature_id");

        if (error) {
            console.error("Erro ao buscar investimentos:", error.message);
            return;
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, name, description, income_id");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }

        const { data: investmentIncomes, error: incomeError } = await supabase
            .from("investment_income")
            .select("id, name");

        if (incomeError) {
            console.error("Erro ao buscar tipos de Renda:", incomeError.message);
            return;
        }

        const { data: brokers, error: brokerError } = await supabase
            .from("broker")
            .select("id, name");

        if (brokerError) {
            console.error("Erro ao buscar corretoras:", brokerError.message);
            return;
        }

        const { data: rentabilities, error: rentabilityError } = await supabase
            .from("investment_rentability")
            .select("type_id, rentability")
            .order("final_date", { ascending: false });

        if (rentabilityError) {
            console.error("Erro ao buscar rentabilidades:", rentabilityError.message);
            return;
        }

        const brokerMap = brokers.reduce((acc, broker) => {
            acc[broker.id] = broker.name;
            return acc;
        }, {} as Record<number, string>);

        const investmentTypeMap = investmentTypes.reduce((acc, type) => {
            acc[type.id] = { name: type.name, description: type.description, income_id: type.income_id };
            return acc;
        }, {} as Record<number, { name: string; description: string; income_id: number }>);

        const investmentIncomeMap = investmentIncomes.reduce((acc, income) => {
            acc[income.id] = income.name;
            return acc;
        }, {} as Record<number, string>);

        const rentabilityMap = rentabilities.reduce((acc, rent) => {
            if (!acc[rent.type_id]) {
                acc[rent.type_id] = rent.rentability;
            }
            return acc;
        }, {} as Record<number, number>);

        const groupedInvestments = movements.reduce<
            Record<string, { name: string; income_name: string; description: string; totalValue: number; updatedValue: number; broker: string; lastRentability: number }>
        >((acc, item) => {
            const investmentData = investmentTypeMap[item.type_id] || { name: "Desconhecido", description: "Sem descrição", income_id: 0 };
            const brokerName = brokerMap[item.broker_id] || "Sem corretora";
            const incomeName = investmentIncomeMap[investmentData.income_id] || "Renda não especificada";
            const rentability = rentabilityMap[item.type_id] || 0;

            const key = `${investmentData.name}-${brokerName}-${incomeName}`;
            const adjustedValue = item.nature_id === 1 ? item.value : -item.value;

            if (!acc[key]) {
                acc[key] = {
                    name: investmentData.name,
                    income_name: incomeName,
                    description: investmentData.description,
                    totalValue: 0,
                    updatedValue: 0,
                    broker: brokerName,
                    lastRentability: rentability
                };
            }
            acc[key].totalValue += adjustedValue;
            acc[key].updatedValue = acc[key].totalValue * (1 + (acc[key].lastRentability / 100));
            return acc;
        }, {});
        setInvestmentsGeral(Object.values(groupedInvestments));

        const totalInvested = Object.values(groupedInvestments).reduce((sum, item) => sum + item.totalValue, 0);
        const totalUpdated = Object.values(groupedInvestments).reduce((sum, item) => sum + item.updatedValue, 0);
        const totalGain = totalUpdated - totalInvested;

        setTotalInvested(totalInvested);
        setTotalUpdated(totalUpdated);
        setTotalGain(totalGain);
    }

    async function fetchTopInvestments() {
        const { data, error } = await supabase
            .from("investment_rentability")
            .select("type_id, rentability");
        if (error) {
            console.error("Erro ao buscar rentabilidade dos investimentos:", error.message);
            return;
        }
        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, description");
        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return;
        }
        const investmentMap: Record<string, number> = {};
        data.forEach(item => {
            const investmentName = investmentTypes.find(type => type.id === item.type_id)?.description || "Desconhecido";
            if (!investmentMap[investmentName]) {
                investmentMap[investmentName] = 0;
            }
            investmentMap[investmentName] += Number(item.rentability);
        });
        const investmentChartData = Object.entries(investmentMap)
            .map(([description, totalRentability]) => ({ description, totalRentability }))
            .sort((a, b) => b.totalRentability - a.totalRentability);
        setBarChartData(investmentChartData);
    }

    return (
        <div className="p-6 space-y-6">
            <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "20px" }}>
                <div style={{ background: "#e0f7fa", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                    <h3>Valor Atualizado</h3>
                    <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                        R$ {totalUpdated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                    <h3>Valor Investido</h3>
                    <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                        R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div style={{ background: totalGain >= 0 ? "#dcedc8" : "#ffcdd2", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                    <h3>Ganho Total</h3>
                    <p style={{ fontSize: "24px", fontWeight: "bold", color: totalGain >= 0 ? "#2e7d32" : "#c62828" }}>
                        R$ {totalGain.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-4">
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
                            <Select
                                onValueChange={(value) =>
                                    setNewRentability({ ...newRentability, type_id: value })
                                }
                                value={newRentability.type_id}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Selecione o Investimento" />
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
                            <Label>Valor Inicial no Período</Label>
                            <Input
                                type="number"
                                value={newRentability.initial_value}
                                onChange={(e) =>
                                    setNewRentability({ ...newRentability, initial_value: e.target.value })
                                }
                            />
                            <Label>Valor Final no Período</Label>
                            <Input
                                type="number"
                                value={newRentability.final_value}
                                onChange={(e) =>
                                    setNewRentability({ ...newRentability, final_value: e.target.value })
                                }
                            />
                            <Label>Aportes no Período (Se houver)</Label>
                            <Input
                                type="number"
                                value={newRentability.contribution_value}
                                onChange={(e) =>
                                    setNewRentability({ ...newRentability, contribution_value: e.target.value })
                                }
                            />
                            <Label>Saques no Período (Se houver)</Label>
                            <Input
                                type="number"
                                value={newRentability.withdrawal_value}
                                onChange={(e) =>
                                    setNewRentability({ ...newRentability, withdrawal_value: e.target.value })
                                }
                            />
                            <Label>Data Inicial</Label>
                            <DatePicker
                                selectedDate={newRentability.initial_date}
                                onSelect={(date) =>
                                    setNewRentability({ ...newRentability, initial_date: date ?? new Date() })
                                }
                            />
                            <Label>Data Final</Label>
                            <DatePicker
                                selectedDate={newRentability.final_date}
                                onSelect={(date) =>
                                    setNewRentability({ ...newRentability, final_date: date ?? new Date() })
                                }
                            />
                            <Button onClick={createRentability}>Salvar</Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            <div className="grid grid-cols-3 gap-6 p-6">
                {/* 📊 Gráfico de Barras (Esquerda) */}
                <div className="bg-white shadow rounded-lg p-4 space-y-6">
                    <ResponsiveContainer width={400} height={300}>
                        <BarChart data={barChartData} layout="vertical">
                            <XAxis type="number" />
                            <YAxis dataKey="description" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="totalRentability" fill="#82ca9d" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="w-full">
                            <ResponsiveContainer width={500} height={300}>
                                <LineChart data={lineChartData}>
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="totalRentability"
                                        stroke="#8884d8"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                    </div>
                </div>

                {/* 📈 Gráficos de Pizza (Centro, Um Acima do Outro) */}
                <div className="bg-white shadow rounded-lg p-4">
                    <div className="bg-white shadow rounded-lg p-4 flex justify-center items-center">
                        <PieChart width={350} height={300}>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            >
                                {pieChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </div>

                    <div className="bg-white shadow rounded-lg p-4 flex justify-center items-center">
                        <PieChart width={350} height={300}>
                            <Pie
                                data={incomeChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={110}
                                innerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                            >
                                {incomeChartData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#fff" strokeWidth={2} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </div>
                </div>

                <div className="p-4 bg-white shadow rounded-lg overflow-auto">
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
            </div>
        </div>
    );
}