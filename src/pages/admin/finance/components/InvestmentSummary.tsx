import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface InvestmentSummaryProps {
  totalInvested: number;
  totalUpdated: number;
  totalGain: number;
}

export function InvestmentSummary({ totalInvested, totalUpdated, totalGain }: InvestmentSummaryProps) {
  const formatValue = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const data = [
    {
      title: "Saldo Atual",
      value: totalUpdated,
      color: "text-purple-700",
      borderColor: "border-purple-700",
      formatValue,
    },
    {
      title: "Total Investido",
      value: totalInvested,
      color: "text-yellow-300",
      borderColor: "border-yellow-300",
      formatValue,
    },
    {
      title: "Saldo Acumulado",
      value: totalGain,
      color: totalGain >= 0 ? "text-green-500" : "text-red-500",
      borderColor: totalGain >= 0 ? "border-green-500" : "border-red-500",
      formatValue,
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
      {data.map((card, index) => (
        <Card key={index} className="p-6 bg-black text-white rounded-lg shadow-md">
          <CardHeader>
            <CardTitle className={`text-xl font-semibold ${card.color} border-b-4 pb-1 ${card.borderColor}`}>
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>{card.formatValue(card.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
