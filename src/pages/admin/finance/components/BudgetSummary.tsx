import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface BudgetSummaryProps {
  planned: number;
  spent: number;
  remaining: number;
  percentage: number;
}

const formatValue = (value: number) =>
  `R$ ${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function BudgetSummary({
  planned,
  spent,
  remaining,
  percentage,
}: BudgetSummaryProps) {
  const data = [
    {
      title: "Orçado",
      value: planned,
      color: "text-yellow-300",
      borderColor: "border-yellow-300",
      format: formatValue,
    },
    {
      title: "Gasto",
      value: spent,
      color: "text-red-400",
      borderColor: "border-red-400",
      format: formatValue,
    },
    {
      title: "Restante",
      value: remaining,
      color:
        remaining < 0
          ? "text-red-500"
          : remaining < planned * 0.3
          ? "text-yellow-400"
          : "text-green-500",
      borderColor:
        remaining < 0
          ? "border-red-500"
          : remaining < planned * 0.3
          ? "border-yellow-400"
          : "border-green-500",
      format: formatValue,
    },
    {
      title: "Uso",
      value: percentage,
      color:
        percentage >= 100
          ? "text-red-500"
          : percentage >= 80
          ? "text-yellow-400"
          : "text-green-500",
      borderColor:
        percentage >= 100
          ? "border-red-500"
          : percentage >= 80
          ? "border-yellow-400"
          : "border-green-500",
      format: (v: number) => `${v}%`,
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-4">
      {data.map((card, index) => (
        <Card
          key={index}
          className="p-6 text-white rounded-lg shadow-md"
        >
          <CardHeader>
            <CardTitle
              className={`text-lg font-semibold border-b-4 pb-1 ${card.color} ${card.borderColor}`}
            >
              {card.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {card.format(card.value)}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}