import { useState } from "react";

import { useSidebar } from "@/components/ui/sidebar";
import { RankingPage } from "@/pages/admin/social/components/RankingPage";

export default function Ranking() {
  const { isMobile } = useSidebar();

  // chave para forçar remount do RankingPage ao atualizar
  const [refreshKey] = useState<number>(Date.now());

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
