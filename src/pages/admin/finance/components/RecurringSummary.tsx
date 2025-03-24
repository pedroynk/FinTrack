import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface RecurringSummaryProps {
    totalFixesReceivable: number;
    totalFixesPay: number;
}

export function RecurringSummary({ totalFixesReceivable, totalFixesPay }: RecurringSummaryProps) {
  const formatValue = (value: number) =>
    `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const data = [
    {
      title: "Total a Receber",
      value: totalFixesReceivable,
      color: "text-green-500",
      borderColor: "border-green-500",
      formatValue,
    },
    {
      title: "Total a Pagar",
      value: totalFixesPay,
      color: "text-red-500",
      borderColor: "border-red-500",
      formatValue,
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3">
      {data.map((card, index) => (
        <Card key={index} className="p-6 text-white rounded-lg shadow-md">
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
