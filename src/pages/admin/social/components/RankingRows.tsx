import { Medal, Clock } from "lucide-react";
import { User } from "./RankingPage";

interface RankingRowProps {
  user: User;
  position: number;
  onUserClick: (user: User) => void;
}

export const RankingRow = ({ user, position, onUserClick }: RankingRowProps) => {
  const getPositionBadge = (pos: number) => {
    if (pos === 1) return "🥇";
    if (pos === 2) return "🥈";
    if (pos === 3) return "🥉";
    return pos.toString();
  };

  const getPositionClass = (pos: number) => {
    if (pos === 1) return "text-gold font-bold";
    if (pos === 2) return "text-silver font-bold";
    if (pos === 3) return "text-bronze font-bold";
    return "text-foreground";
  };

  const getActivityColor = (activity: string) => {
    if (activity.includes("Online agora")) return "text-green-500";
    if (activity.includes("horas")) return "text-yellow-500";
    if (activity.includes("dia")) return "text-orange-500";
    return "text-muted-foreground";
  };

  return (
    <div className="grid grid-cols-11 gap-4 p-4 bg-ranking-row hover:bg-ranking-row-hover transition-colors cursor-pointer"
         onClick={() => onUserClick(user)}>
      <div className={`col-span-1 flex items-center text-lg ${getPositionClass(position)}`}>
        {getPositionBadge(position)}
      </div>
      
      <div className="col-span-1 flex items-center">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-border"
          onClick={() => onUserClick(user)}
        />
      </div>
      
      <div 
        className="col-span-4 flex items-center text-foreground font-medium cursor-pointer hover:text-accent"
      >
        {user.name}
      </div>
      
      <div className="col-span-2 flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Medal className="h-4 w-4 text-gold" />
          <span className="text-gold text-sm">{user.medals.gold}</span>
        </div>
        <div className="flex items-center gap-1">
          <Medal className="h-4 w-4 text-silver" />
          <span className="text-silver text-sm">{user.medals.silver}</span>
        </div>
        <div className="flex items-center gap-1">
          <Medal className="h-4 w-4 text-bronze" />
          <span className="text-bronze text-sm">{user.medals.bronze}</span>
        </div>
      </div>
      
      <div className="col-span-2 flex items-center">
        <span className="text-foreground font-semibold">
          {user.score.toLocaleString()} pts
        </span>
      </div>
      
      <div className="col-span-1 flex items-center">
        <div className={`flex items-center gap-1 ${getActivityColor(user.lastActivity)}`}>
          <Clock className="h-3 w-3" />
          <span className="text-xs">{user.lastActivity}</span>
        </div>
      </div>
    </div>
  );
};