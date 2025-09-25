"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Overview } from "./components/overview";
import { supabase } from "@/lib/supabase";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionsTable } from "./components/TransactionsTable";
import { Transaction } from "@/types/finance";
import { KpiCardProps, KpiCardsGrid } from "./components/KpiCard";
import { DonutChart, DonutChartData } from "./components/PieChart";
import { fetchTransactions } from "@/api/finance";



const today = new Date();
const currentMonth = today.getMonth() + 1;
const currentYear = today.getFullYear();

interface CardsData {
  year: number;
  month: number;
  receita_total: number;
  despesa_total: number;
}

export default function Dashboard() {
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [receitaTotal, setReceitaTotal] = useState<number>(0);
  const [despesaTotal, setDespesaTotal] = useState<number>(0);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [donutChartDataReceita, setDonutChartDataReceita] = useState<DonutChartData[]>([]);
  const [donutChartDataDespesa, setDonutChartDataDespesa] = useState<DonutChartData[]>([]);

  const [datasets, setDatasets] = useState<CardsData[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const kpiCardsData: KpiCardProps[] = [
      {
        title: "Receita Total",
        value: receitaTotal,
        color: "text-green-600 border-green-500",
        description: null,
        isLoading: cardsLoading,
        trendText:  null,
        formatValue: (value: number) => {return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      },
      {
        title: "Despesa Total",
        value: despesaTotal,
        color: "text-red-600 border-red-500",
        description: null,
        isLoading: cardsLoading,
        trendText: null,
        formatValue: (value: number) => {return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
      },
      {
        title: "Saldo",
        value: receitaTotal - despesaTotal,
        color: "text-yellow-600 border-yellow-500",
        description: null,
        isLoading: cardsLoading,
        trendText:  null,
        formatValue: (value: number) => {
          const percent = receitaTotal ? (value / receitaTotal) * 100 : 0;
          return `${value > 0 ? value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : (0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${percent.toFixed(2)}%)`;
        },
      }
  ]

  const fetchChartData = async (): Promise<CardsData[]> => {
    try {
      const { data, error } = await supabase
        .from("vw_value_by_nature_year_month")
        .select("year, month, receita_total, despesa_total");
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erro ao buscar dados do gráfico:", error);
      return [];
    }
  };


  const fetchCardsData = async (): Promise<CardsData | null> => {
    try {
      const { data, error } = await supabase
        .from("vw_value_by_nature_year_month")
        .select("year, month, receita_total, despesa_total")
        .eq("year", selectedYear)
        .eq("month", selectedMonth)
        .single();
  
      if (error) throw error;
      return data as CardsData;
    } catch (error) {
      console.error("Erro ao buscar dados dos cards:", error);
      return null;
    }
  };
  
  const fetchPieChartData = async (
    transactions: Transaction[],
    nature: string
  ): Promise<DonutChartData[]> => {
    const groupedData: Record<string, DonutChartData> = {};
  
    transactions.forEach((transaction) => {
      const natureName = transaction.class?.type?.nature?.name;
      const typeName = transaction.class?.type?.name;
      const typeColor = transaction.class?.type?.hex_color;
      const value = transaction.value;
  
    
      if (!natureName || natureName !== nature) {
        return;
      }
  
      if (!groupedData[typeName]) {
        groupedData[typeName] = { type: typeName, total_value: 0, fill: typeColor || "#CCCCCC" };
      }
  
      groupedData[typeName].total_value += value;
    });
  
    return Object.values(groupedData);
  };
  

  const fetchTransactionsData = async () => {
    try {
      const lastDayOfMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  
      const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01T00:00:00.000Z`;
      const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${lastDayOfMonth}T23:59:59.999Z`;
  
      const transactions = await fetchTransactions(1, 100, startDate, endDate);
      
      return transactions;
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return [];
    }
  };

  useEffect(() => {
    async function getCardsData() {
      setCardsLoading(true);
      const data = await fetchCardsData();
      if (data) {
        setReceitaTotal(data.receita_total);
        setDespesaTotal(data.despesa_total);
      } else {
        setReceitaTotal(0);
        setDespesaTotal(0);
      }
      setCardsLoading(false);
    }
    async function getTransactions() {
      const data = await fetchTransactionsData();
      setTransactions(data);

      const receitaData = await fetchPieChartData(data, "Receita");
      const despesaData = await fetchPieChartData(data, "Despesa");
      
      setDonutChartDataReceita(receitaData);
      setDonutChartDataDespesa(despesaData);
    }

    getTransactions();
    getCardsData();
    
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    async function getChartData() {
      setCardsLoading(true);
      const datasets = await fetchChartData();
      setDatasets(datasets);
      setCardsLoading(false);
    }
    getChartData();
  }, []);

  const receitaTransactions = transactions.filter(
    (transaction) => transaction.class?.type?.nature?.name === "Receita"
  )
  const despesaTransactions = transactions.filter(
    (transaction) => transaction.class?.type?.nature?.name === "Despesa"
  )

  return (
    <>
      <div className="flex-col md:flex overflow-x-hidden">
        <div className="flex-1 space-y-4 p-8 pt-6">

          {/* Filters */}
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <div className="flex items-center space-x-2">
              {/* Month Select (ShadCN UI) */}
              <Select
                onValueChange={(value) => setSelectedMonth(Number(value))}
                defaultValue={String(selectedMonth)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Mês" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(12)].map((_, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {new Date(0, i).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Year Select */}
              <Select
                onValueChange={(value) => setSelectedYear(Number(value))}
                defaultValue={String(selectedYear)}
              >
                <SelectTrigger className="w-full sm:w-[120px]">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  {[...Array(currentYear - 2021 + 1)].map((_, i) => {
                    const year = 2021 + i; // Generates years from 2021 up to currentYear
                    return (
                      <SelectItem key={year} value={String(year)}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Button>Download</Button>
            </div>
          </div>

          {/* Dashboard */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Mensal</TabsTrigger>
              <TabsTrigger value="analytics">Anual</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              {/* Cards Grid */}
              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
                <KpiCardsGrid data={kpiCardsData}/>
                <Tabs defaultValue="despesa">
                  <TabsList>
                    <TabsTrigger value="receita">Receitas</TabsTrigger>
                    <TabsTrigger value="despesa">Despesas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="receita">
                    <DonutChart data={donutChartDataReceita}/>
                  </TabsContent>
                  <TabsContent value="despesa">
                    <DonutChart data={donutChartDataDespesa}/> 
                  </TabsContent>
                </Tabs>
                
              </div>
              {/* Charts */}

              <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-5">
                <Overview datasets={datasets} />
                <Tabs defaultValue="despesa" className="sm:col-span-1 lg:col-span-2">
                  <TabsList>
                    <TabsTrigger value="receita">Receitas</TabsTrigger>
                    <TabsTrigger value="despesa">Despesas</TabsTrigger>
                  </TabsList>
                  <TabsContent value="receita">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transações Neste Mês</CardTitle>
                        <CardDescription>
                          Você fez {receitaTransactions.length} transações de Receita em {new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" })}.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransactionsTable transactions={receitaTransactions}/>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="despesa">
                    <Card>
                      <CardHeader>
                        <CardTitle>Transações Neste Mês</CardTitle>
                        <CardDescription>
                          Você fez {despesaTransactions.length} transações de Despesa em {new Date(selectedYear, selectedMonth - 1).toLocaleString("default", { month: "long" })}.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TransactionsTable transactions={despesaTransactions}/>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
