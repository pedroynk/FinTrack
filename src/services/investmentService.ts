import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

/**
 * Tipagem das entidades usadas
 */
export interface InvestmentMovement {
    type_id: number;
    value: number;
    broker_id: number;
    nature_id?: number;
}

export interface InvestmentType {
    name_id: number;
    description: string;
}

export interface Broker {
    id: number;
    name: string;
}

export interface InvestmentSummary {
    name: string;
    income_name: string;
    description: string;
    totalValue: number;
    updatedValue: number;
    broker: string
    income_id: number;
}

/**
 *  Função para buscar o resumo dos investimentos
 */
export async function fetchInvestmentSummary() {
    const { data: movements, error } = await supabase
        .from("investment_movement")
        .select("type_id, value, broker_id, nature_id");

    if (error) {
        console.error("Erro ao buscar investimentos:", error.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const { data: investmentTypes, error: typeError } = await supabase
        .from("investment_type")
        .select("id, description, name_id");

    if (typeError) {
        console.error("Erro ao buscar tipos de investimento:", typeError.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const { data: investmentNames, error: nameError } = await supabase
        .from("investment_name")
        .select("id, name, income_id");

    if (nameError) {
        console.error("Erro ao buscar nomes de investimentos:", nameError.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const { data: investmentIncomes, error: incomeError } = await supabase
        .from("investment_income")
        .select("id, name");

    if (incomeError) {
        console.error("Erro ao buscar tipos de Renda:", incomeError.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const { data: brokers, error: brokerError } = await supabase
        .from("broker")
        .select("id, name");

    if (brokerError) {
        console.error("Erro ao buscar corretoras:", brokerError.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const { data: rentabilities, error: rentabilityError } = await supabase
        .from("investment_rentability")
        .select("type_id, rentability")
        .order("final_date", { ascending: false });

    if (rentabilityError) {
        console.error("Erro ao buscar rentabilidades:", rentabilityError.message);
        return { investments: [], invested: 0, updated: 0, gain: 0 };
    }

    const brokerMap = Object.fromEntries(brokers.map(b => [b.id, b.name]));
    const investmentNameMap = Object.fromEntries(investmentNames.map(n => [n.id, { name: n.name, income_id: n.income_id }]));
    const investmentIncomeMap = Object.fromEntries(investmentIncomes.map(i => [i.id, i.name]));
    const investmentTypeMap = Object.fromEntries(
        investmentTypes.map(t => [
            t.id,
            {
                description: t.description,
                name_id: t.name_id,
            }
        ])
    );

    const rentabilityMap = rentabilities.reduce((acc, rent) => {
        if (!acc[rent.type_id]) {
            acc[rent.type_id] = rent.rentability;
        }
        return acc;
    }, {} as Record<number, number>);

    const groupedInvestments = movements.reduce<Record<string, any>>((acc, item) => {
        const investmentData = investmentTypeMap[item.type_id] || { name_id: 0, description: "Sem descrição" };
        const nameData = investmentNameMap[investmentData.name_id] || { name: "Desconhecido", income_id: 0 };
        const brokerName = brokerMap[item.broker_id] || "Sem corretora";
        const incomeName = investmentIncomeMap[nameData.income_id] || "Renda não especificada";
        const rentability = rentabilityMap[item.type_id] || 0;

        const key = `${nameData.name}-${investmentData.description}-${brokerName}-${incomeName}`;
        const adjustedValue = item.nature_id === 1 ? item.value : -item.value;

        if (!acc[key]) {
            acc[key] = {
                name: nameData.name,
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

    const investments = Object.values(groupedInvestments);
    const totalInvested = investments.reduce((sum, item) => sum + item.totalValue, 0);
    const totalUpdated = investments.reduce((sum, item) => sum + item.updatedValue, 0);
    const totalGain = totalUpdated - totalInvested;

    return { investments, invested: totalInvested, updated: totalUpdated, gain: totalGain };
}



/**
 *  Funções para buscar dados
 */
export async function fetchInvestments() {
    const { data, error } = await supabase.from("investment_movement").select("*");
    if (error) console.error("Erro ao buscar investimentos:", error.message);
    return data || [];
}

export async function fetchInvestmentTypes() {
    const { data, error } = await supabase.from("investment_type").select("*");
    if (error) console.error("Erro ao buscar tipos de investimento:", error.message);
    return data || [];
}

export async function fetchInvestmentNames() {
    const { data, error } = await supabase.from("investment_name").select("*");
    if (error) console.error("Erro ao buscar nome de investimento:", error.message);
    return data || [];
}

export async function fetchBrokers() {
    const { data, error } = await supabase.from("broker").select("*");
    if (error) console.error("Erro ao buscar corretoras:", error.message);
    return data || [];
}

export async function fetchNatures() {
    const { data, error } = await supabase.from("investment_nature").select("*");
    if (error) console.error("Erro ao buscar Naturezas:", error.message);
    return data || [];
}

export async function fetchIncomes() {
    const { data, error } = await supabase.from("investment_income").select("*");
    if (error) console.error("Erro ao buscar tipos de renda:", error.message);
    return data || [];
}

export async function fetchMovements() {
    try {
        const { data: natures, error: natureError } = await supabase
            .from("investment_nature")
            .select("id, name");

        if (natureError) {
            console.error("Erro ao buscar naturezas:", natureError.message);
            return [];
        }

        const { data: investmentTypes, error: typeError } = await supabase
            .from("investment_type")
            .select("id, description");

        if (typeError) {
            console.error("Erro ao buscar tipos de investimento:", typeError.message);
            return [];
        }

        const { data: movements, error } = await supabase
            .from("investment_movement")
            .select("date, value, nature_id, type_id");

        if (error) {
            console.error("Erro ao buscar movimentações:", error.message);
            return [];
        }

        const investmentTypeMap = Object.fromEntries(
            (investmentTypes || []).map((type) => [type.id, type.description])
        );

        const natureMap = Object.fromEntries(
            (natures || []).map((nature) => [nature.id, nature.name])
        );

        const formattedMovements = movements.map((mov) => ({
            date: new Date(mov.date).toLocaleDateString("pt-BR"),
            value: parseFloat(mov.value.toFixed(2)),
            movement: natureMap[mov.nature_id] || "Tipo Desconhecido",
            description: investmentTypeMap[mov.type_id] || "Sem descrição"
        }));

        return formattedMovements;

    } catch (err) {
        console.error("Erro ao buscar dados:", err);
        return [];
    }
}

export async function fetchInvestmentDistribution() {
    const { data: investments, error: invError } = await supabase
        .from("investment_movement")
        .select("type_id, value, nature_id");

    if (invError) {
        console.error("Erro ao buscar investimentos:", invError.message);
        return [];
    }

    const { data: investmentTypes, error: typeError } = await supabase
        .from("investment_type")
        .select("id, name_id");

    if (typeError) {
        console.error("Erro ao buscar tipos de investimento:", typeError.message);
        return [];
    }

    const { data: investmentNames, error: nameError } = await supabase
        .from("investment_name")
        .select("id, name");

    if (nameError) {
        console.error("Erro ao buscar nomes de investimento:", nameError.message);
        return [];
    }

    const nameMap = Object.fromEntries(investmentNames.map(n => [n.id, n.name]));

    const typeMap = Object.fromEntries(
        investmentTypes.map(t => [t.id, nameMap[t.name_id] || "Desconhecido"])
    );

    const groupedData = investments.reduce<Record<string, { name: string; value: number }>>((acc, item) => {
        const investmentName = typeMap[item.type_id] || `Tipo ${item.type_id}`;
        const adjustedValue = item.nature_id === 1 ? item.value : -item.value;

        if (!acc[investmentName]) {
            acc[investmentName] = { name: investmentName, value: 0 };
        }
        acc[investmentName].value += adjustedValue;
        return acc;
    }, {});

    const totalInvested = Object.values(groupedData).reduce((sum, item) => sum + item.value, 0);

    const percentageData = Object.values(groupedData).map(item => ({
        name: item.name,
        value: totalInvested ? parseFloat(((item.value / totalInvested) * 100).toFixed(2)) : 0,
    }));

    return percentageData;
}

export async function fetchTopInvestments() {
    const { data: rentabilities, error } = await supabase
        .from("investment_rentability")
        .select("type_id, rentability");

    if (error) {
        console.error("Erro ao buscar rentabilidade dos investimentos:", error.message);
        return [];
    }

    const { data: investmentTypes, error: typeError } = await supabase
        .from("investment_type")
        .select("id, name_id");

    if (typeError) {
        console.error("Erro ao buscar tipos de investimento:", typeError.message);
        return [];
    }

    const { data: investmentNames, error: nameError } = await supabase
        .from("investment_name")
        .select("id, name");

    if (nameError) {
        console.error("Erro ao buscar nomes de investimento:", nameError.message);
        return [];
    }

    const nameMap = Object.fromEntries(investmentNames.map(n => [n.id, n.name]));

    const typeMap = Object.fromEntries(
        investmentTypes.map(t => [t.id, nameMap[t.name_id] || "Desconhecido"])
    );

    const investmentMap: Record<string, number> = {};
    rentabilities.forEach(item => {
        const investmentName = typeMap[item.type_id] || "Desconhecido";
        if (!investmentMap[investmentName]) {
            investmentMap[investmentName] = 0;
        }
        investmentMap[investmentName] += Number(item.rentability);
    });

    const investmentChartData = Object.entries(investmentMap)
        .map(([description, totalRentability]) => ({ description, totalRentability }))
        .sort((a, b) => b.totalRentability - a.totalRentability);

    return investmentChartData;
}

export async function fetchIncomeDistribution() {
    const { data: movements, error: movementError } = await supabase
        .from("investment_movement")
        .select("type_id, value, nature_id");

    if (movementError) {
        console.error("Erro ao buscar movimentações:", movementError.message);
        return [];
    }

    const { data: investmentTypes, error: typeError } = await supabase
        .from("investment_type")
        .select("id, name_id");

    if (typeError) {
        console.error("Erro ao buscar tipos de investimento:", typeError.message);
        return [];
    }

    const { data: investmentNames, error: nameError } = await supabase
        .from("investment_name")
        .select("id, income_id");

    if (nameError) {
        console.error("Erro ao buscar nomes de investimento:", nameError.message);
        return [];
    }

    const { data: incomeTypes, error: incomeError } = await supabase
        .from("investment_income")
        .select("id, name");

    if (incomeError) {
        console.error("Erro ao buscar nomes de renda:", incomeError.message);
        return [];
    }

    const nameToIncomeMap = Object.fromEntries(
        investmentNames.map((n) => [n.id, n.income_id])
    );

    const incomeMap = Object.fromEntries(
        incomeTypes.map((i) => [i.id, i.name])
    );

    const typeToIncomeMap = Object.fromEntries(
        investmentTypes.map((t) => [t.id, nameToIncomeMap[t.name_id] || 0])
    );

    const incomeData = movements.reduce<Record<string, number>>((acc, item) => {
        const incomeId = typeToIncomeMap[item.type_id] || 0;
        const incomeName = incomeMap[incomeId] || "Renda não especificada";
        const value = item.nature_id === 1 ? item.value : -item.value;

        if (!acc[incomeName]) {
            acc[incomeName] = 0;
        }
        acc[incomeName] += value;
        return acc;
    }, {});

    const totalIncome = Object.values(incomeData).reduce((sum, val) => sum + val, 0);

    const percentageData = Object.keys(incomeData).map((key) => ({
        name: key,
        value: totalIncome ? parseFloat(((incomeData[key] / totalIncome) * 100).toFixed(2)) : 0,
    }));

    return percentageData;
}


/**
 *  Criar Investimento
 */
export async function createInvestment(newInvestment: InvestmentMovement) {
    const { error } = await supabase.from("investment_movement").insert([
        {
            ...newInvestment,
            value: parseFloat(newInvestment.value.toString()),
        },
    ]);

    if (error) {
        toast({
            title: "Erro",
            description: `Falha ao adicionar Investimento: ${error.message}`,
            variant: "destructive",
            duration: 2000,
        });
        return { success: false, error: error.message };
    }

    toast({
        title: "Sucesso",
        description: "Investimento adicionado com sucesso!",
        duration: 2000,
    });
    return { success: true };
}

/**
 *  Tipo de Investimento
 */
export async function createInvestmentType(newType: InvestmentType) {
    const { error } = await supabase.from("investment_type").insert([newType]);

    if (error) {
        toast({
            title: "Erro",
            description: `Falha ao adicionar Tipo de Investimento: ${error.message}`,
            variant: "destructive",
            duration: 2000,
        });
        return { success: false, error: error.message };
    }

    toast({
        title: "Sucesso",
        description: "Tipo de Investimento adicionado com sucesso!",
        duration: 2000,
    });
    return { success: true };
}

/**
 *  Criar Rentabilidade do Investimento
 */
export async function createRentability(newRentability: any) {
    let initialValue = parseFloat(newRentability.initial_value);
    let finalValue = parseFloat(newRentability.final_value);
    let withdrawalValue = parseFloat(newRentability.withdrawal_value);
    let contributionValue = parseFloat(newRentability.contribution_value);

    if (isNaN(initialValue)) initialValue = 0;
    if (isNaN(finalValue)) finalValue = 0;
    if (isNaN(withdrawalValue)) withdrawalValue = 0;
    if (isNaN(contributionValue)) contributionValue = 0;

    if (initialValue === 0 || finalValue === 0) {
        toast({
            title: "Erro",
            description: "Os valores iniciais e finais são obrigatórios.",
            variant: "destructive",
            duration: 2000,
        });
        return { success: false };
    }

    let adjustedInitialValue = initialValue + contributionValue - withdrawalValue;

    const rentability = ((finalValue - adjustedInitialValue) / adjustedInitialValue) * 100;

    const valueRentability = finalValue - adjustedInitialValue;

    const natureId = valueRentability >= 0 ? 1 : 2;

    const { data: investmentTypeData, error: typeError } = await supabase
        .from("investment_type")
        .select("description")
        .eq("id", newRentability.type_id)
        .single();

    if (typeError || !investmentTypeData) {
        toast({
            title: "Erro",
            description: "Falha ao buscar descrição do tipo de investimento.",
            variant: "destructive",
            duration: 2000,
        });
        return { success: false, error: typeError?.message };
    }

    const description = investmentTypeData.description;

    const { error: rentabilityError } = await supabase.from("investment_rentability").insert([
        {
            ...newRentability,
            rentability,
            value_rentability: valueRentability,
            initial_value: initialValue,
            final_value: finalValue,
            withdrawal_value: withdrawalValue,
            contribution_value: contributionValue,
            class_id: 24,
        },
    ]);

    if (rentabilityError) {
        toast({
            title: "Erro",
            description: `Falha ao adicionar Rentabilidade: ${rentabilityError.message}`,
            variant: "destructive",
            duration: 2000,
        });
        return { success: false, error: rentabilityError.message };
    }

    const { error: transactionError } = await supabase.from("transaction").insert([
        {
            nature_id: natureId,
            class_id: 24,
            description,
            value: valueRentability,
            date: newRentability.final_date,
        },
    ]);

    if (transactionError) {
        toast({
            title: "Erro",
            description: `Falha ao adicionar Transação: ${transactionError.message}`,
            variant: "destructive",
            duration: 2000,
        });
        return { success: false, error: transactionError.message };
    }

    toast({
        title: "Sucesso",
        description: "Rentabilidade e transação registradas com sucesso!",
        duration: 2000,
    });

    return { success: true };
}

export async function fetchRentabilityOverTime() {
    const { data, error } = await supabase
        .from("investment_rentability")
        .select("rentability, initial_date, final_date");

    if (error) {
        console.error("Erro ao buscar rentabilidade por tempo:", error.message);
        return [];
    }

    const groupedData: { month: string; totalRentability: number }[] = [];

    data.forEach(item => {
        const startDate = new Date(item.initial_date);
        const endDate = new Date(item.final_date);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            console.error("Data inválida encontrada:", item);
            return;
        }

        // Número total de dias no período
        const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        let current = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), 1);

        while (current <= endDate) {
            const monthKey = `${current.getUTCFullYear()}-${String(current.getUTCMonth() + 1).padStart(2, '0')}`;

            const monthStart = new Date(current.getUTCFullYear(), current.getUTCMonth(), 1);
            const monthEnd = new Date(current.getUTCFullYear(), current.getUTCMonth() + 1, 0);

            // Calculando os dias do período dentro desse mês
            const start = Math.max(monthStart.getTime(), startDate.getTime());
            const end = Math.min(monthEnd.getTime(), endDate.getTime());
            const daysInMonthCount = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            // Rentabilidade proporcional ao número de dias do mês
            const monthRentability = (daysInMonthCount / totalDays) * item.rentability;

            let existing = groupedData.find(d => d.month === monthKey);
            if (!existing) {
                existing = { month: monthKey, totalRentability: 0 };
                groupedData.push(existing);
            }
            existing.totalRentability += monthRentability;

            // Avança para o próximo mês
            current.setMonth(current.getMonth() + 1);
        }
    });

    // Filtra apenas os meses que possuem registros válidos
    const validMonths = new Set(data.map(item => {
        return `${new Date(item.initial_date).getUTCFullYear()}-${String(new Date(item.initial_date).getUTCMonth() + 1).padStart(2, '0')}`;
    }));

    const filteredGroupedData = groupedData.filter(d => validMonths.has(d.month));

    return filteredGroupedData;
}

