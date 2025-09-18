import { Medal, UserMinus, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User } from "./RankingPage";

interface UserProfileProps {
  user: User;
  onRemoveFromNetwork: (userId: number) => void;
  onBlockUser: (userId: number) => void;
}

export const UserProfile = ({ user, onRemoveFromNetwork, onBlockUser }: UserProfileProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center space-y-4">
        <img
          src={user.avatar}
          alt={user.name}
          className="w-24 h-24 rounded-full object-cover border-4 border-border"
        />
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
          <p className="text-muted-foreground">{user.score.toLocaleString()} pontos</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-3">Medalhas</h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center p-3 bg-secondary rounded-lg">
              <Medal className="h-6 w-6 text-gold mb-1" />
              <span className="text-lg font-bold text-gold">{user.medals.gold}</span>
              <span className="text-xs text-muted-foreground">Ouro</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-secondary rounded-lg">
              <Medal className="h-6 w-6 text-silver mb-1" />
              <span className="text-lg font-bold text-silver">{user.medals.silver}</span>
              <span className="text-xs text-muted-foreground">Prata</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-secondary rounded-lg">
              <Medal className="h-6 w-6 text-bronze mb-1" />
              <span className="text-lg font-bold text-bronze">{user.medals.bronze}</span>
              <span className="text-xs text-muted-foreground">Bronze</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Última Atividade</h4>
          <Badge variant="outline" className="w-full justify-center gap-2">
            {user.lastActivity}
          </Badge>
        </div>
      </div>

      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => onRemoveFromNetwork(user.id)}
          className="flex-1 gap-2"
        >
          <UserMinus className="h-4 w-4" />
          Remover da Rede
        </Button>
        <Button
          variant="destructive"
          onClick={() => onBlockUser(user.id)}
          className="flex-1 gap-2"
        >
          <Ban className="h-4 w-4" />
          Bloquear
        </Button>
      </div>
    </div>
  );
};