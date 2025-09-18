import { Clock } from "lucide-react";
import { User } from "./RankingPage";

interface RankingRowProps {
  user: User;
  position: number;
  onUserClick: (user: User) => void;
}

export const RankingRow = ({ user, position, onUserClick }: RankingRowProps) => {
  const getPositionBadge = (pos: number) =>
    pos === 1 ? "🥇" : pos === 2 ? "🥈" : pos === 3 ? "🥉" : String(pos);

  const getPositionClass = (pos: number) =>
    pos === 1
      ? "text-gold font-bold"
      : pos === 2
      ? "text-silver font-bold"
      : pos === 3
      ? "text-bronze font-bold"
      : "text-foreground";

  return (
    <button
      onClick={() => onUserClick(user)}
      className="w-full text-left focus:outline-none focus-visible:ring px-3 sm:px-4 py-3 hover:bg-muted/50 transition-colors"
      aria-label={`Abrir perfil de ${user.name}`}
    >
      {/* Grid alinhado ao cabeçalho: xs=6, sm=8, md=11 */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 items-center gap-3 sm:gap-4 text-sm">
        {/* Pos */}
        <div className={`col-span-1 flex items-center text-base sm:text-lg tabular-nums ${getPositionClass(position)}`}>
          {getPositionBadge(position)}
        </div>

        {/* Foto */}
        <div className="col-span-1">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-border"
            loading="lazy"
          />
        </div>

        {/* Nome + atividade compacta em mobile */}
        <div className="col-span-3 sm:col-span-3 md:col-span-4 flex items-center gap-2 min-w-0">
          <span className="truncate font-medium hover:text-accent transition-colors">{user.name}</span>
          <span className="md:hidden text-[11px] text-muted-foreground whitespace-nowrap">
            • {user.lastActivity}
          </span>
        </div>

        {/* Medalhas (apenas sm+) */}
        <div className="hidden sm:flex sm:col-span-2 items-center gap-3 whitespace-nowrap">
          <span title="Ouro" className="tabular-nums">🥇 {user.medals.gold}</span>
          <span title="Prata" className="tabular-nums">🥈 {user.medals.silver}</span>
          <span title="Bronze" className="tabular-nums">🥉 {user.medals.bronze}</span>
        </div>

        {/* Pontuação */}
        <div className="col-span-1 sm:col-span-1 md:col-span-2 font-semibold tabular-nums">
          {user.score.toLocaleString()} pts
        </div>

        {/* Atividade (apenas md+) */}
        <div className="hidden md:flex md:col-span-1 items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-xs">{user.lastActivity}</span>
        </div>
      </div>
    </button>
  );
};
