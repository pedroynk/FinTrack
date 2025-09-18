import { useState } from "react";
import { RefreshCw, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RankingRow } from "./RankingRows";
import { UserProfile } from "./UserProfile";
import profile1 from "@/assets/profile1.jpg";
import profile2 from "@/assets/profile2.jpg";
import profile3 from "@/assets/profile3.jpg";
import profile4 from "@/assets/profile4.jpg";
import profile5 from "@/assets/profile5.jpg";

export interface User {
  id: number;
  name: string;
  avatar: string;
  score: number;
  medals: {
    gold: number;
    silver: number;
    bronze: number;
  };
  lastActivity: string;
}

const rankingData: User[] = [
  {
    id: 1,
    name: "Carlos Mendes",
    avatar: profile1,
    score: 2850,
    medals: { gold: 15, silver: 8, bronze: 3 },
    lastActivity: "2 horas atrás",
  },
  {
    id: 2,
    name: "Ana Silva",
    avatar: profile2,
    score: 2720,
    medals: { gold: 12, silver: 10, bronze: 5 },
    lastActivity: "Online agora",
  },
  {
    id: 3,
    name: "Roberto Santos",
    avatar: profile3,
    score: 2650,
    medals: { gold: 10, silver: 15, bronze: 8 },
    lastActivity: "1 dia atrás",
  },
  {
    id: 4,
    name: "Maria Oliveira",
    avatar: profile4,
    score: 2480,
    medals: { gold: 8, silver: 12, bronze: 10 },
    lastActivity: "3 horas atrás",
  },
  {
    id: 5,
    name: "Felipe Costa",
    avatar: profile5,
    score: 2320,
    medals: { gold: 6, silver: 9, bronze: 15 },
    lastActivity: "5 dias atrás",
  },
];

export const RankingPage = () => {
  const [users, setUsers] = useState<User[]>(rankingData);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const handleAddToNetwork = (userId: number) => {
    toast.success("Usuário adicionado à sua rede!");
  };

  const handleRemoveFromNetwork = (userId: number) => {
    setIsDialogOpen(false);
    toast.success("Usuário removido da sua rede!");
  };

  const handleBlockUser = (userId: number) => {
    toast.success("Usuário bloqueado!");
    setIsDialogOpen(false);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setIsDialogOpen(true);
  };

  const handleRefresh = () => {
    toast.success("Ranking atualizado!");
  };

  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      toast.error("Por favor, insira um email válido!");
      return;
    }
    
    // Simular adição de usuário
    toast.success(`Convite enviado para ${newUserEmail}!`);
    setNewUserEmail("");
    setIsAddUserDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">Ranking</h1>
            <Button 
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
          
          <Button 
            className="w-full gap-2 mb-6"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Adicionar ao Ranking
          </Button>
        </div>

        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="grid grid-cols-11 gap-4 p-4 bg-secondary text-secondary-foreground font-semibold text-sm">
            <div className="col-span-1">Pos</div>
            <div className="col-span-1">Foto</div>
            <div className="col-span-4">Nome</div>
            <div className="col-span-2">Medalhas</div>
            <div className="col-span-2">Pontuação</div>
            <div className="col-span-1">Atividade</div>
          </div>
          
          <div className="divide-y divide-border">
            {users.map((user, index) => (
              <RankingRow
                key={user.id}
                user={user}
                position={index + 1}
                onUserClick={handleUserClick}
              />
            ))}
          </div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <UserProfile
              user={selectedUser}
              onRemoveFromNetwork={handleRemoveFromNetwork}
              onBlockUser={handleBlockUser}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar ao Ranking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email do usuário</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUser()}
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddUser}
                className="flex-1"
              >
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};