import { useState } from "react";
import RankingPage from "@/pages/admin/social/components/RankingPage";

export default function Social() {
  // se quiser forçar remount, atualize essa key via setRefreshKey(Date.now())
  const [refreshKey] = useState<number>(Date.now());

  return (
    <div className="min-h-screen bg-background">
      {/* Importante: o RankingPage já possui seu próprio container/paddings.
          Não crie outro container aqui para evitar “container duplo”. */}
      <div
        className={[
          "w-full min-w-0",
          "px-0",                 // sem paddings extras
          "overflow-x-hidden",    // evita barra dupla: o RP já tem overflow-x onde precisa

          // polimento em mobile p/ quaisquer botões internos
          "max-sm:[&_button]:text-xs max-sm:[&_button]:h-9 max-sm:[&_button]:px-3",
          "max-sm:[&_button_svg]:w-4 max-sm:[&_button_svg]:h-4",
        ].join(" ")}
      >
        <RankingPage key={refreshKey} />
      </div>
    </div>
  );
}
