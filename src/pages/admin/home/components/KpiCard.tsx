import { Loader2, TrendingUp } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";

export type KpiCardProps = {
  title: string;
  value: number;
  color: string;
  description: string | null;
  isLoading: boolean;
  trendText: string | null;
  formatValue: (value: number) => string;
};

export function KpiCard({ title, value, color, description, isLoading, trendText, formatValue }: KpiCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`text-xl font-semibold border-b-4 pb-1 ${color}`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="animate-spin" />
        ) : (
          <div className={`text-2xl font-bold ${color}`}>
            {formatValue(value)}
          </div>
        )}
      </CardContent>
      {description || trendText &&
        <CardFooter className="flex-col gap-2 text-sm">
          {trendText && <div className="flex items-center gap-2 font-medium leading-none">
            {trendText} <TrendingUp className="h-4 w-4" />
          </div>}
          {description && <div className="leading-none text-muted-foreground">{description}</div>}
        </CardFooter>
      }
    </Card>
  );
}

interface KpiCardsGridProps {
  data: KpiCardProps[];
}

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ data }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      {data.map((card, index) => (
        <KpiCard key={index} {...card} />
      ))}
    </div>
  );
};
