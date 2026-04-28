import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface BudgetSummaryProps {
  planned: number;
  expense: number;
  income: number;
  projectedExpense: number;
}

const formatValue = (value: number) =>
  `R$ ${Number(value || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export function BudgetSummary({
  planned,
  expense,
  income,
  projectedExpense,
}: BudgetSummaryProps) {
  const net = income - expense;

  const expensePercentage =
    planned > 0 ? Number(((expense / planned) * 100).toFixed(1)) : 0;

  const projectedPercentage =
    planned > 0 ? Number(((projectedExpense / planned) * 100).toFixed(1)) : 0;

  const expenseColor = expense > planned ? "text-red-500" : "text-yellow-300";
  const resultColor = net >= 0 ? "text-green-500" : "text-red-500";

  const projectionColor =
    projectedExpense > planned ? "text-red-500" : "text-muted-foreground";

  const data = [
    {
      title: "Orçado",
      value: planned,
      color: "text-yellow-300",
      borderColor: "border-yellow-300",
      detail: "Limite planejado para o mês",
    },
    {
      title: "Gasto",
      value: expense,
      color: expenseColor,
      borderColor: expense > planned ? "border-red-500" : "border-yellow-300",
      detail: `${expensePercentage}% usado`,
      extra: `Previsão: ${formatValue(projectedExpense)} · ${projectedPercentage}%`,
      extraColor: projectionColor,
    },
    {
      title: "Receita",
      value: income,
      color: "text-green-500",
      borderColor: "border-green-500",
      detail: "Recebido no mês",
    },
    {
      title: "Resultado",
      value: net,
      color: resultColor,
      borderColor: net >= 0 ? "border-green-500" : "border-red-500",
      detail: income >= expense ? "Saldo positivo" : "Saldo negativo",
    },
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-4">
      {data.map((card) => (
        <Card key={card.title} className="p-6 rounded-lg shadow-md">
          <CardHeader>
            <CardTitle
              className={`text-lg font-semibold border-b-4 pb-1 ${card.color} ${card.borderColor}`}
            >
              {card.title}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className={`text-3xl font-bold ${card.color}`}>
              {formatValue(card.value)}
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              {card.detail}
            </p>

            {card.extra && (
              <p className={`mt-1 text-xs font-medium ${card.extraColor}`}>
                {card.extra}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}