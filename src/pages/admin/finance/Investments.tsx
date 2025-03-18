import { useEffect, useState } from "react";
import { 
    fetchInvestmentSummary, 
    fetchIncomeDistribution, 
    fetchInvestmentDistribution, 
    fetchMovements, 
    fetchRentabilityOverTime, 
    fetchTopInvestments 
} from "@/api/investment";

import { InvestmentSummary } from "@/pages/admin/finance/components/InvestmentSummary";
import { InvestmentCharts } from "@/pages/admin/finance/components/InvestmentChart";
import { InvestmentFormDialog } from "@/pages/admin/finance/components/InvestmentFormDialog";
import { InvestmentTables } from "@/pages/admin/finance/components/InvestmentTable";

const COLORS = ["#7500ff", "#fffa00", "#0009bd", "#FF8042", "#ff0000", "#00a92b"];

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
            <InvestmentSummary totalInvested={totalInvested} totalUpdated={totalUpdated} totalGain={totalGain}   />
            <InvestmentFormDialog />
            <InvestmentCharts pieChartData={pieChartData} incomeChartData={incomeChartData} barChartData={barChartData} lineChartData={lineChartData} COLORS={COLORS}/>
            <InvestmentTables investmentsGeral={investmentsGeral} movements={movements} />
        </div>
    );
}
