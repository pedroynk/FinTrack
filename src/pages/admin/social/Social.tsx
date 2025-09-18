import { useState } from "react";
import { RefreshCw, Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { RankingPage } from "@/pages/admin/social/components/RankingPage";

export default function Ranking() {
  const { toast } = useToast();
  const { isMobile } = useSidebar();

  // chave para forçar remount do RankingPage ao atualizar
  const [refreshKey, setRefreshKey] = useState<number>(Date.now());
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    try {
      setLoading(true);
      // se o RankingPage buscar dados no mount/useEffect, esse key novo vai remontar o componente
      setRefreshKey(Date.now());
      toast({
        title: "Atualizando",
        description: "Recarregando o ranking…",
        duration: 1500,
      });
    } catch (e) {
      toast({
        title: "Erro",
        description: `Falha ao atualizar ranking: ${e}`,
        variant: "destructive",
        duration: 2500,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container mx-auto sm:px-4 lg:px-8">
      <div className="sm:p-2 lg:p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-4">
        </div>

        {/* Conteúdo do Ranking */}
        <div className={isMobile ? "p-0" : "p-0"}>
          <RankingPage key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
