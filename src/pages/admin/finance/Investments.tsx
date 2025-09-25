import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

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

import type {
  DistributionSlice,
  IncomePoint,
  InvestmentGeral,
  InvestmentSummaryResponse,
  MovementRow,
  RentabilityDTO,
  TopInvestmentDTO,
  RawInvestment
} from "@/types/investments";

const COLORS = ["#7500ff", "#fffa00", "#0009bd", "#FF8042", "#ff0000", "#00a92b"];

// Normaliza o payload da API para o shape exigido por InvestmentTables (sem "any")
const normalizeInvestmentGeral = (i: RawInvestment): InvestmentGeral => ({
  name: typeof i.name === "string" ? i.name : (i.description ?? i.ticker ?? "—"),
  description: typeof i.description === "string" ? i.description : (i.name ?? "—"),
  updatedValue: Number(i.updatedValue ?? i.updated ?? i.total ?? 0),
  income_name:
    typeof i.income_name === "string"
      ? i.income_name
      : (i.incomeName ?? i.income?.name ?? "—"),
});

// Dispara um resize no próximo frame para Recharts/medidas recalcularem
const triggerResize = () => {
  requestAnimationFrame(() => {
    window.dispatchEvent(new Event("resize"));
  });
};

export default function Investments() {
  // Estados alinhados aos componentes (tipados)
  const [investmentsGeral, setInvestmentsGeral] = useState<InvestmentGeral[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [pieChartData, setPieChartData] = useState<DistributionSlice[]>([]);
  const [barChartData, setBarChartData] = useState<TopInvestmentDTO[]>([]);
  const [lineChartData, setLineChartData] = useState<RentabilityDTO[]>([]);
  const [incomeChartData, setIncomeChartData] = useState<IncomePoint[]>([]);
  const [totalInvested, setTotalInvested] = useState<number>(0);
  const [totalUpdated, setTotalUpdated] = useState<number>(0);
  const [totalGain, setTotalGain] = useState<number>(0);

  // Ref do container para observar mudanças de largura (ex.: abrir/fechar menu)
  const containerRef = useRef<HTMLDivElement>(null);

  // Ref da área onde ficam os botões do InvestmentFormDialog (usado para trocar labels)
  const actionsRef = useRef<HTMLElement>(null);

  // Dispara resizes escalonados ao entrar na página (garante reflow dos gráficos)
  useEffect(() => {
    const ids = [40, 200, 400].map((ms) => setTimeout(triggerResize, ms));
    return () => ids.forEach(clearTimeout);
  }, []);

  // Dispara resize ao mudar de rota (ex.: Dashboard -> Investimentos)
  const location = useLocation();
  useEffect(() => {
    const id = setTimeout(triggerResize, 60);
    return () => clearTimeout(id);
  }, [location.pathname]);

  // Observa mudanças de largura do container (menu colapsa/expande, etc.)
  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => triggerResize());
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Mobile: "Adicionar X" -> "+ X" | Desktop: restaura label completo
  useEffect(() => {
    const root = actionsRef.current;
    if (!root) return;

    const isMobile = () => window.matchMedia("(max-width: 640px)").matches;

    const updateLabels = () => {
      const buttons = root.querySelectorAll<HTMLButtonElement>("button");
      const mobile = isMobile();

      buttons.forEach((btn) => {
        const full = btn.getAttribute("data-full");

        if (!full) {
          const original = btn.innerHTML.trim();
          // versão curta: troca "Adicionar " por "+ "
          const compact = original.replace(/Adicionar\s+/gi, "+ ");
          // se não tinha "Adicionar", deixa como está (evita mexer em botões sem esse padrão)
          btn.setAttribute("data-full", original);
          btn.setAttribute("data-short", compact);
        }

        const toApply = mobile
          ? btn.getAttribute("data-short") ?? btn.innerHTML
          : btn.getAttribute("data-full") ?? btn.innerHTML;

        if (toApply && btn.innerHTML !== toApply) {
          btn.innerHTML = toApply;
        }
      });
    };

    updateLabels();

    const onResize = () => updateLabels();
    window.addEventListener("resize", onResize);

    // Observa re-render/abertura de diálogos que criam botões novos
    const mo = new MutationObserver(updateLabels);
    mo.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      window.removeEventListener("resize", onResize);
      mo.disconnect();
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      const { investments, invested, updated, gain } =
        (await fetchInvestmentSummary()) as InvestmentSummaryResponse;

      const normalized = (investments ?? []).map(normalizeInvestmentGeral);
      setInvestmentsGeral(normalized);

      setTotalInvested(invested);
      setTotalUpdated(updated);
      setTotalGain(gain);

      const movementsData = (await fetchMovements()) as MovementRow[];
      setMovements(movementsData);
    }

    async function loadDistribution() {
      const distributionData = (await fetchInvestmentDistribution()) as DistributionSlice[];
      setPieChartData(distributionData);
    }

    async function loadIncomeDistribution() {
      const incomeData = (await fetchIncomeDistribution()) as IncomePoint[];
      setIncomeChartData(incomeData);
    }

    async function loadTopInvestments() {
      const topInvestments = (await fetchTopInvestments()) as TopInvestmentDTO[];
      setBarChartData(topInvestments);
    }

    async function loadRentability() {
      const rentabilityData = (await fetchRentabilityOverTime()) as RentabilityDTO[];
      setLineChartData(rentabilityData);
    }

    loadData();
    loadDistribution();
    loadIncomeDistribution();
    loadTopInvestments();
    loadRentability();
  }, []);

  return (
    <main
      ref={containerRef}
      // Container centralizado, com limites e sem “empurrões” horizontais
      className="
        w-full max-w-7xl mx-auto
        px-3 sm:px-4 md:px-6 lg:px-8
        min-w-0 overflow-x-hidden
        space-y-6
      "
    >
      <section className="w-full min-w-0">
        <InvestmentSummary
          totalInvested={totalInvested}
          totalUpdated={totalUpdated}
          totalGain={totalGain}
        />
      </section>

      {/* Ações (botões) — responsivo e com label dinâmico (+ em mobile) */}
      <section
        ref={actionsRef}
        className="
          w-full min-w-0

          /* Texto/padding/altura fluidos em TODOS os botões dentro dessa seção */
          [&_button]:!text-[clamp(0.70rem,2.6vw,0.875rem)]
          [&_button]:!h-[clamp(2.125rem,5.2vw,2.5rem)]
          [&_button]:!px-[clamp(0.5rem,2vw,0.75rem)]
          [&_button]:!leading-none
          [&_button_svg]:!w-[clamp(0.9rem,2.6vw,1rem)]
          [&_button_svg]:!h-[clamp(0.9rem,2.6vw,1rem)]

          /* Se houver 2+ botões lado a lado, espaço consistente */
          [&_button]:mr-2
          max-[400px]:[&_button]:mr-1
        "
      >
        <InvestmentFormDialog />
      </section>

      <section className="w-full min-w-0">
        <InvestmentCharts
          pieChartData={pieChartData}
          incomeChartData={incomeChartData}
          barChartData={barChartData}     // { description, totalRentability }[]
          lineChartData={lineChartData}   // { month, totalRentability }[]
          COLORS={COLORS}
        />
      </section>

      <section className="w-full min-w-0 overflow-x-auto">
        <InvestmentTables
          investmentsGeral={investmentsGeral} // { name, description, updatedValue, income_name }[]
          movements={movements}               // { date, value, movement, description }[]
        />
      </section>
    </main>
  );
}
