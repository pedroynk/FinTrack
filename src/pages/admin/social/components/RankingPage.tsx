import { useState } from "react";
import { RefreshCw, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import profile1 from "@/assets/profile1.jpg";
import profile2 from "@/assets/profile2.jpg";
import profile3 from "@/assets/profile3.jpg";
import profile4 from "@/assets/profile4.jpg";
import profile5 from "@/assets/profile5.jpg";

export interface User { id: number; name: string; avatar: string; score: number; medals: { gold: number; silver: number; bronze: number; }; lastActivity: string; }
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

// ⭐️ Linha responsiva de referência
function RankingRow({ user, position, onUserClick }: { user: User; position: number; onUserClick: (u: User) => void }) {
  return (
    <button
      onClick={() => onUserClick(user)}
      className="w-full text-left focus:outline-none focus-visible:ring px-3 sm:px-4 py-3 hover:bg-muted/50"
    >
      {/* GRID: muda a quantidade de colunas por breakpoint */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 items-center gap-3 sm:gap-4 text-sm">
        {/* Pos */}
        <div className="col-span-1 font-semibold tabular-nums">{position}</div>

        {/* Foto */}
        <div className="col-span-1">
          <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
        </div>

        {/* Nome (ocupa mais espaço no mobile) */}
        <div className="col-span-3 sm:col-span-3 md:col-span-4 flex items-center gap-2">
          <span className="truncate font-medium">{user.name}</span>
          <span className="md:hidden text-xs text-muted-foreground">• {user.lastActivity}</span>
        </div>

        {/* Medalhas (esconde no xs; mostra do sm pra cima) */}
        <div className="hidden sm:flex sm:col-span-2 items-center gap-3 whitespace-nowrap">
          <span title="Ouro" className="tabular-nums">🥇 {user.medals.gold}</span>
          <span title="Prata" className="tabular-nums">🥈 {user.medals.silver}</span>
          <span title="Bronze" className="tabular-nums">🥉 {user.medals.bronze}</span>
        </div>

        {/* Pontuação */}
        <div className="col-span-1 sm:col-span-1 md:col-span-2 font-semibold tabular-nums">{user.score}</div>

        {/* Atividade (esconde em xs e sm; mostra em md+) */}
        <div className="hidden md:block md:col-span-1 text-muted-foreground">{user.lastActivity}</div>
      </div>
    </button>
  );
}

export default function RankingPage() {
  const [users] = useState<User[]>(rankingData);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");

  const handleRemoveFromNetwork = () => {
    setIsDialogOpen(false);
    toast.success("Usuário removido da sua rede!");
  };

  const handleBlockUser = () => {
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
    toast.success(`Convite enviado para ${newUserEmail}!`);
    setNewUserEmail("");
    setIsAddUserDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* container com paddings responsivos */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Ranking</h1>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span className="hidden xs:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          {/* Botão full width no mobile, auto em sm+ */}
          <Button
            className="w-full sm:w-auto gap-2 mb-4 sm:mb-6"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Adicionar ao Ranking
          </Button>
        </div>

        {/* Tabela/Lista responsiva com scroll horizontal opcional */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          {/* Wrapper com overflow-x para telas muito estreitas */}
          <div className="overflow-x-auto">
            {/* Cabeçalho com grid responsivo */}
            <div className="min-w-full sm:w-[640px] md:min-w-0 grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 gap-3 sm:gap-4 p-3 sm:p-4 bg-secondary text-secondary-foreground font-semibold text-xs sm:text-sm">
              <div className="col-span-1">Pos</div>
              <div className="col-span-1">Foto</div>
              <div className="col-span-3 sm:col-span-3 md:col-span-4">Nome</div>
              <div className="hidden sm:block sm:col-span-2">Medalhas</div>
              <div className="col-span-1 sm:col-span-1 md:col-span-2">Pontuação</div>
              <div className="hidden md:block md:col-span-1">Atividade</div>
            </div>

            {/* Linhas */}
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
      </div>

      {/* Dialog Perfil (coloque seu UserProfile real aqui) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img src={selectedUser.avatar} className="h-auto md:h-12 w-full md:w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold">{selectedUser.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.lastActivity}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-center">
                <div className="rounded-md border p-2">
                  <div className="text-xs text-muted-foreground">Ouro</div>
                  <div className="font-semibold tabular-nums">{selectedUser.medals.gold}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-xs text-muted-foreground">Prata</div>
                  <div className="font-semibold tabular-nums">{selectedUser.medals.silver}</div>
                </div>
                <div className="rounded-md border p-2">
                  <div className="text-xs text-muted-foreground">Bronze</div>
                  <div className="font-semibold tabular-nums">{selectedUser.medals.bronze}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" className="flex-1" onClick={handleBlockUser}>
                  Bloquear
                </Button>
                <Button variant="secondary" className="flex-1" onClick={handleRemoveFromNetwork}>
                  Remover da rede
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog Adicionar */}
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
                  onKeyDown={(e) => e.key === "Enter" && handleAddUser()}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsAddUserDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleAddUser} className="flex-1">
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
