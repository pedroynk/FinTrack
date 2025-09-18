import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import RankingPage from "@/pages/admin/social/components/RankingPage";

export default function Ranking() {
  const { isMobile } = useSidebar();

  // se quiser forçar remount, atualize essa key via setRefreshKey(Date.now())
  const [refreshKey] = useState<number>(Date.now());

  return (
    <div className="min-h-screen bg-background">
      {/* Evita container duplo: deixe o container dentro do RankingPage OU aqui, não nos dois */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Header/ações (se/quando existirem) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4">
          {/* espaço para filtros/abas/botões */}
        </div>

        {/* Conteúdo */}
        <div
          className={[
            // padding/raio só no desktop; no mobile, full-bleed
            "rounded-none sm:rounded-xl",
            "border-0 sm:border border-border",
            // se o RankingPage tiver grids largos, permita scroll horizontal no mobile
            "overflow-x-auto",
            // quando tiver sidebar sobreposto no mobile, remova paddings extras
            isMobile ? "p-0" : "p-0",
          ].join(" ")}
        >
          {/* Dica: se a tabela interna tiver min-width (ex.: min-w-[640px]) o scroll horizontal funciona */}
          <RankingPage key={refreshKey} />
        </div>
      </div>
    </div>
  );
}
