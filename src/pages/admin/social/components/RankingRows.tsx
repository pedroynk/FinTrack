import { Clock } from "lucide-react";
import { User } from "./RankingPage";

interface RankingRowProps {
  user: User;
  position: number;
  onUserClick: (user: User) => void;
}

export const RankingRow = ({ user, position, onUserClick }: RankingRowProps) => {
  const badge = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : String(position);
  const posClass =
    position === 1 ? "text-gold font-bold" :
    position === 2 ? "text-silver font-bold" :
    position === 3 ? "text-bronze font-bold" : "text-foreground";

  return (
    <button
      onClick={() => onUserClick(user)}
      className="w-full text-left focus:outline-none focus-visible:ring px-3 sm:px-4 py-3 hover:bg-muted/50 transition-colors"
      aria-label={`Abrir perfil de ${user.name}`}
    >
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 items-center gap-3 sm:gap-4 text-sm">
        <div className={`col-span-1 flex items-center justify-center sm:justify-start text-base sm:text-lg tabular-nums ${posClass}`}>
          {badge}
        </div>

        <div className="col-span-1">
          <img
            src={user.avatar}
            alt={user.name}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-border"
            loading="lazy"
          />
        </div>

        {/* Nome sem truncate no mobile; atividade embaixo */}
        <div className="col-span-3 sm:col-span-3 md:col-span-4 min-w-0">
          <span className="block font-medium leading-snug break-words sm:truncate">{user.name}</span>
          <span className="block md:hidden text-[11px] text-muted-foreground leading-tight">• {user.lastActivity}</span>
        </div>

        <div className="hidden sm:flex sm:col-span-2 items-center gap-3 whitespace-nowrap">
          <span className="tabular-nums">🥇 {user.medals.gold}</span>
          <span className="tabular-nums">🥈 {user.medals.silver}</span>
          <span className="tabular-nums">🥉 {user.medals.bronze}</span>
        </div>

        <div className="col-span-1 sm:col-span-1 md:col-span-2 font-semibold tabular-nums text-right">
          {user.score.toLocaleString()} pts
        </div>

        <div className="hidden md:flex md:col-span-1 items-center gap-1 text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span className="text-xs">{user.lastActivity}</span>
        </div>
      </div>
    </button>
  );
};
