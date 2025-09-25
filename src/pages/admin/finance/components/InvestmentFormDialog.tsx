import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { fetchInvestmentTypes, fetchNatures, createInvestment, createInvestmentType, createRentability, fetchInvestmentNames } from "@/api/investment";
import { toast } from "@/hooks/use-toast";

// Definição de Tipos
interface Investment {
    type_id: number;
    nature_id: number;
    value: number;
    date: string;
}

interface InvestmentType {
    id: number;
    name: string;
    description: string;
}

interface Nature {
    id: number;
    name: string;
}

interface InvestmentName {
    id: number;
    income_id: number;
    name: string;
}

interface Rentability {
    type_id: number;
    initial_value: number;
    final_value: number;
    withdrawal_value: number;
    contribution_value: number;
    initial_date: string;
    final_date: string;
}

export function InvestmentFormDialog() {
    const [open, setOpen] = useState(false);
    const [openType, setOpenType] = useState(false);
    const [openRentability, setOpenRentability] = useState(false);

    const [types, setTypes] = useState<InvestmentType[]>([]);
    const [natures, setNatures] = useState<Nature[]>([]);
    const [names, setNames] = useState<InvestmentName[]>([]);


    const [newInvestment, setNewInvestment] = useState<Investment>({
        type_id: 0,
        nature_id: 0,
        value: 0,
        date: "",
    });

    const [newType, setNewType] = useState({
        name_id: 0,
        description: "",
    });

    const [newRentability, setNewRentability] = useState<Rentability>({
        type_id: 0,
        initial_value: 0,
        final_value: 0,
        withdrawal_value: 0,
        contribution_value: 0,
        initial_date: "",
        final_date: "",
    });

    useEffect(() => {
        async function loadData() {
            setTypes(await fetchInvestmentTypes());
            setNatures(await fetchNatures());
            setNames(await fetchInvestmentNames());
        }
        loadData();
    }, []);

    async function handleCreateInvestment() {
        const response = await createInvestment(newInvestment);
        if (response.success) {
            toast({ title: "Sucesso", description: "Movimentação adicionada!", duration: 2000 });
            setOpen(false);
        } else {
            toast({ title: "Erro", description: response.error, variant: "destructive", duration: 2000 });
        }
        
    }

    async function handleCreateInvestmentType() {
        const response = await createInvestmentType(newType);
        if (response.success) {
            toast({ title: "Sucesso", description: "Tipo de investimento adicionado!", duration: 2000 });
            setOpenType(false);
        } else {
            toast({ title: "Erro", description: response.error, variant: "destructive", duration: 2000 });
        }
    }

    async function handleCreateRentability() {
        const response = await createRentability(newRentability);
        if (response.success) {
            toast({ title: "Sucesso", description: "Rentabilidade cadastrada!", duration: 2000 });
            setOpenRentability(false);
        } else {
            toast({ title: "Erro", description: response.error, variant: "destructive", duration: 2000 });
        }
    }

    return (
        <div className="flex justify-end gap-4">
            {/* Diálogo de Nova Movimentação */}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button>Adicionar Movimentação</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nova Movimentação</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                        <Label>Data</Label>
                        <DatePicker
                            date={
                                newInvestment.date &&
                                    !isNaN(new Date(newInvestment.date).getTime())
                                    ? new Date(newInvestment.date)
                                    : new Date()
                            }
                            onSelect={(date) =>
                                setNewInvestment({
                                    ...newInvestment,
                                    date: date
                                        ? date.toISOString()
                                        : new Date().toISOString(),
                                })
                            }
                        />
                        <Label>Movimento</Label>
                        <Select onValueChange={(value) => setNewInvestment({ ...newInvestment, nature_id: Number(value) })} value={newInvestment.nature_id.toString()}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Movimento" />
                            </SelectTrigger>
                            <SelectContent>
                                {natures.map((n) => (
                                    <SelectItem key={n.id} value={n.id.toString()}>
                                        {n.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label>Valor</Label>
                        <Input type="number" min="1" value={newInvestment.value} onChange={(e) => setNewInvestment({ ...newInvestment, value: Number(e.target.value) })} />

                        <Label>Investimento</Label>
                        <Select onValueChange={(value) => setNewInvestment({ ...newInvestment, type_id: Number(value) })} value={newInvestment.type_id.toString()}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Tipo" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>
                                        {t.description}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button onClick={handleCreateInvestment}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Novo Investimento */}
            <Dialog open={openType} onOpenChange={setOpenType}>
                <DialogTrigger asChild>
                    <Button>Adicionar Investimento</Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Novo Investimento</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-1 gap-4">
                        <Label>Nome</Label>
                        <Select
                            onValueChange={(value) => setNewType({ ...newType, name_id: Number(value) })}
                            value={newType.name_id.toString()}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Tipo de Investimento" />
                            </SelectTrigger>
                            <SelectContent>
                                {names.map((name) => (
                                    <SelectItem key={name.id} value={name.id.toString()}>
                                        {name.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label>Descrição</Label>
                        <Input type="text" value={newType.description} onChange={(e) => setNewType({ ...newType, description: e.target.value })} />

                        <Button onClick={handleCreateInvestmentType}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Diálogo de Calculo de Rentabilidade */}
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
                            onValueChange={(value) => setNewRentability({ ...newRentability, type_id: Number(value) })}
                            value={newRentability.type_id.toString()}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione o Investimento" />
                            </SelectTrigger>
                            <SelectContent>
                                {types.map((t) => (
                                    <SelectItem key={t.id} value={t.id.toString()}>{t.description}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Label>Valor Inicial no Período</Label>
                        <Input
                            type="number"
                            value={newRentability.initial_value}
                            onChange={(e) => setNewRentability({ ...newRentability, initial_value: Number(e.target.value) })}
                        />

                        <Label>Valor Final no Período</Label>
                        <Input
                            type="number"
                            value={newRentability.final_value}
                            onChange={(e) => setNewRentability({ ...newRentability, final_value: Number(e.target.value) })}
                        />

                        <Label>Aportes no Período (Se houver)</Label>
                        <Input
                            type="number"
                            value={newRentability.contribution_value}
                            onChange={(e) => setNewRentability({ ...newRentability, contribution_value: Number(e.target.value) })}
                        />

                        <Label>Saques no Período (Se houver)</Label>
                        <Input
                            type="number"
                            value={newRentability.withdrawal_value}
                            onChange={(e) => setNewRentability({ ...newRentability, withdrawal_value: Number(e.target.value) })}
                        />

                        <Label>Data Inicial</Label>
                        <DatePicker
                            date={newRentability.initial_date ? new Date(newRentability.initial_date) : new Date()}
                            onSelect={(date) =>
                                setNewRentability({
                                    ...newRentability,
                                    initial_date: date ? date.toISOString() : new Date().toISOString(),
                                })
                            }
        />

                        <Label>Data Final</Label>
                        <DatePicker
                            date={newRentability.final_date ? new Date(newRentability.final_date) : new Date()}
                            onSelect={(date) =>
                                setNewRentability({
                                    ...newRentability,
                                    final_date: date ? date.toISOString() : new Date().toISOString(),
                                })
                            }
          />

                        <Button onClick={handleCreateRentability}>Salvar</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    );
}
