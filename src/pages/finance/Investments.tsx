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

export default function Investments() {
    const [investments, setInvestments] = useState<any[]>([]);
    const [natures, setNatures] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [brokers, setBrokers] = useState<any[]>([]);
    const [incomes, setIncomes] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [newInvestment, setNewInvestment] = useState({
        type_id: "",
        broker_id: "",
        income_id: "",
        nature_id: "",
        value: "",
        date: new Date(),
        description: "",
    });

    useEffect(() => {
        fetchInvestments();
        fetchTypes();
        fetchBrokers();
        fetchNatures();
        fetchIncomes();
    }, []);

    const fetchInvestments = async () => {
        const { data } = await supabase.from("investment").select("*");
        setInvestments(data || []);
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
        const { error } = await supabase.from("investment").insert([
            {
                ...newInvestment,
                value: parseFloat(newInvestment.value),
            },
        ]);

        if (error) {
            toast({
                title: "Erro",
                description: `Falha ao adicionar transação: ${error.message}`,
                variant: "destructive",
                duration: 2000,
            });
        } else {
            toast({
                title: "Sucesso",
                description: "Transação adicionada com sucesso!",
                duration: 2000,
            });
            fetchInvestments();
            setOpen(false);
        }
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
                                            {t.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Nenhum tipo encontrado
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                        <Label>Descrição</Label>
                        <Input
                            type="text"
                            value={newInvestment.description}
                            onChange={(e) =>
                                setNewInvestment({ ...newInvestment, description: e.target.value })
                            }
                        />
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
                        <Label>Tipo de Renda</Label>
                        <Select
                            onValueChange={(value) =>
                                setNewInvestment({ ...newInvestment, income_id: value })
                            }
                            value={newInvestment.income_id}
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
                        <Button onClick={createInvestment}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}