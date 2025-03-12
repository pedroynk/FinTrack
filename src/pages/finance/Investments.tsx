import { useEffect, useState } from "react";
import { fetchIncomeDistribution, fetchInvestmentDistribution, fetchInvestmentSummary, fetchMovements, fetchRentabilityOverTime, fetchTopInvestments } from "@/services/investmentService";
import { InvestmentSummary } from "@/components/finance/investments/Summary";
import { InvestmentDialogs } from "@/components/finance/investments/Dialogs";
import { InvestmentTables } from "@/components/finance/investments/Tables";
import { InvestmentCharts } from "@/components/finance/investments/Charts";

const COLORS = ["#FACD19", "#00C49F", "#FFBB28", "#FF8042", "#D32F2F", "#7B1FA2"];

export default function Investments() {
    const [investmentsGeral, setInvestmentsGeral] = useState<any[]>([]);
    const [movements, setMovements] = useState<any[]>([]);
    const [pieChartData, setPieChartData] = useState<any[]>([]);
    const [barChartData, setBarChartData] = useState<any[]>([]);
    const [lineChartData, setLineChartData] = useState<any[]>([]);
    const [incomeChartData, setIncomeChartData] = useState<any[]>([]);
    const [totalInvested, setTotalInvested] = useState<number>(0);
    const [totalUpdated, setTotalUpdated] = useState<number>(0);
    const [totalGain, setTotalGain] = useState<number>(0);

    useEffect(() => {
        async function loadData() {
            const { investments, invested, updated, gain } = await fetchInvestmentSummary();
            setInvestmentsGeral(investments);
            setTotalInvested(invested);
            setTotalUpdated(updated);
            setTotalGain(gain);

            const movementsData = await fetchMovements();
            setMovements(movementsData);
        }
        loadData();

        async function loadDistribution() {
            const distributionData = await fetchInvestmentDistribution();
            setPieChartData(distributionData);
        }
        loadDistribution();

        async function loadIncomeDistribution() {
            const incomeData = await fetchIncomeDistribution();
            setIncomeChartData(incomeData);
        }
        loadIncomeDistribution();

        async function loadTopInvestments() {
            const topInvestments = await fetchTopInvestments();
            setBarChartData(topInvestments);
        }
        loadTopInvestments();

        async function loadRentability() {
            const rentabilityData = await fetchRentabilityOverTime();
            setLineChartData(rentabilityData);
        }
        loadRentability();

    }, []);

    return (
        <div className="p-6 space-y-6">
            <InvestmentSummary totalInvested={totalInvested} totalUpdated={totalUpdated} totalGain={totalGain} />
            <InvestmentDialogs />
            <InvestmentCharts pieChartData={pieChartData} incomeChartData={incomeChartData} barChartData={barChartData} lineChartData={lineChartData} COLORS={COLORS}/>
            <InvestmentTables investmentsGeral={investmentsGeral} movements={movements} />
        </div>
    );
}
