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
import { normalizeAvatarUrl } from "@/lib/avatar";

export interface User {
  id: number;
  name: string;
  avatar: string;
  score: number;
  medals: { gold: number; silver: number; bronze: number };
  lastActivity: string;
}

const rankingData: User[] = [
  { id: 1, name: "Carlos",  avatar: profile1, score: 2850, medals: { gold: 15, silver:  8, bronze:  3 }, lastActivity: "2 horas atrás" },
  { id: 2, name: "Ana",      avatar: profile2, score: 2720, medals: { gold: 12, silver: 10, bronze:  5 }, lastActivity: "Online agora" },
  { id: 3, name: "Gael", avatar: profile3, score: 2650, medals: { gold: 10, silver: 15, bronze:  8 }, lastActivity: "1 dia atrás" },
  { id: 4, name: "Maria", avatar: profile4, score: 2480, medals: { gold:  8, silver: 12, bronze: 10 }, lastActivity: "3 horas atrás" },
  { id: 5, name: "Felipe",   avatar: profile5, score: 2320, medals: { gold:  6, silver:  9, bronze: 15 }, lastActivity: "5 dias atrás" },
];

/** Linha (mantida para sm+ como tabela) */
function TableRow({
  user, position, onUserClick,
}: { user: User; position: number; onUserClick: (u: User) => void }) {
  return (
    <button
      onClick={() => onUserClick(user)}
      className="w-full text-left focus:outline-none focus-visible:ring px-3 sm:px-4 py-3 hover:bg-muted/50"
      aria-label={`Abrir perfil de ${user.name}`}
    >
      {/* xs=6 | sm=8 | md=11 colunas */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-11 items-center gap-3 sm:gap-4 text-sm">
        {/* Pos */}
        <div className="col-span-1 font-semibold tabular-nums text-center sm:text-left">{position}</div>

        {/* Foto */}
        <div className="col-span-1">
          <img
            src={normalizeAvatarUrl(user.avatar)}
            alt={user.name}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-border"
            loading="lazy"
          />
        </div>

        {/* Nome + atividade (atividade some em md+) */}
        <div className="col-span-3 sm:col-span-3 md:col-span-4 min-w-0">
          <span className="block font-medium leading-snug break-words sm:truncate">
            {user.name}
          </span>
          <span className="block md:hidden text-[11px] text-muted-foreground leading-tight">
            {user.lastActivity}
          </span>
        </div>

        {/* Medalhas (somente sm+) */}
        <div className="hidden sm:flex sm:col-span-2 items-center gap-3 whitespace-nowrap">
          <span className="tabular-nums">🥇 {user.medals.gold}</span>
          <span className="tabular-nums">🥈 {user.medals.silver}</span>
          <span className="tabular-nums">🥉 {user.medals.bronze}</span>
        </div>

        {/* Pontuação (direita) */}
        <div className="col-span-1 sm:col-span-1 md:col-span-2 font-semibold tabular-nums text-right">
          {user.score.toLocaleString()}
        </div>

        {/* Atividade (somente md+) */}
        <div className="hidden md:block md:col-span-1 text-muted-foreground">
          {user.lastActivity}
        </div>
      </div>
    </button>
  );
}

/** Cartão mobile (preenche a largura; placar mais largo; card mais alto) */
/** Cartão mobile robusto (zoom-safe) */
function MobileCard({
  user, position, onUserClick,
}: { user: User; position: number; onUserClick: (u: User) => void }) {
  return (
    <button
      onClick={() => onUserClick(user)}
      aria-label={`Abrir perfil de ${user.name}`}
      className="
        w-full text-left rounded-2xl border border-border bg-card
        p-4              /* padding maior */
        min-h-[78px]     /* altura mínima: evita “cortes” quando nome quebra */
        focus:outline-none focus-visible:ring
        hover:bg-muted/40 transition-colors
        overflow-hidden
      "
    >
      <div className="flex items-center gap-3">
        {/* Posição */}
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted/20 text-xs font-semibold tabular-nums shrink-0">
          {position}
        </span>

        {/* Avatar + texto (ocupa o que sobrar) */}
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <img
            src={normalizeAvatarUrl(user.avatar)}
            alt={user.name}
            className="h-12 w-12 rounded-full object-cover border border-border shrink-0"
            loading="lazy"
          />
          <div className="min-w-0 leading-snug">
            {/* até 2 linhas; quebra palavras longas */}
            <div className="font-medium break-words line-clamp-2">
              {user.name}
            </div>
            <div className="text-[11px] text-muted-foreground leading-tight">
              {user.lastActivity}
            </div>
          </div>
        </div>

        {/* Placar (largura mínima maior; medalhas podem quebrar) */}
        <div className="flex-none text-right pl-1 min-w-[112px]">
          <div className="text-lg font-semibold tabular-nums leading-tight whitespace-nowrap">
            {user.score.toLocaleString()}
          </div>
          <div className="mt-0.5 text-[11px] text-muted-foreground leading-4 break-words">
            🥇{user.medals.gold} 🥈{user.medals.silver} 🥉{user.medals.bronze}
          </div>
        </div>
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

  const handleUserClick = (u: User) => { setSelectedUser(u); setIsDialogOpen(true); };
  const handleRefresh = () => toast.success("Ranking atualizado!");
  const handleAddUser = () => {
    if (!newUserEmail.trim()) return toast.error("Por favor, insira um email válido!");
    toast.success(`Convite enviado para ${newUserEmail}!`);
    setNewUserEmail(""); setIsAddUserDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
            <h1 className="font-bold text-[clamp(1.25rem,4.5vw,1.875rem)]">Ranking</h1>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                <span className="hidden sm:inline">Atualizar</span>
              </Button>
            </div>
          </div>

          {/* Botão: full no mobile; rótulo curto sem duplicar “+” */}
          <Button
            className="w-full sm:w-auto gap-2 mb-4 sm:mb-6"
            onClick={() => setIsAddUserDialogOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span className="sm:hidden">Ranking</span>
            <span className="hidden sm:inline">Adicionar ao Ranking</span>
          </Button>
        </div>

        {/* ===== Mobile (cartões horizontais) ===== */}
        <div className="space-y-2 sm:hidden">
          {users.map((u, i) => (
            <MobileCard key={u.id} user={u} position={i + 1} onUserClick={handleUserClick} />
          ))}
        </div>

        {/* ===== sm+ (tabela responsiva) ===== */}
        <div className="hidden sm:block bg-card rounded-lg border border-border overflow-hidden mt-2 sm:mt-0">
          <div className="overflow-x-auto">
            {/* Cabeçalho */}
            <div className="w-full grid grid-cols-8 md:grid-cols-11 gap-4 p-4 bg-secondary text-secondary-foreground font-semibold text-sm">
              <div className="col-span-1">Pos</div>
              <div className="col-span-3 md:col-span-4">Nome</div>
              <div className="hidden md:block md:col-span-2">Medalhas</div>
              <div className="col-span-1 md:col-span-2 text-right">Pontuação</div>
              <div className="hidden md:block md:col-span-1">Atividade</div>
            </div>
            {/* Linhas */}
            <div className="divide-y divide-border">
              {users.map((u, i) => (
                <TableRow key={u.id} user={u} position={i + 1} onUserClick={handleUserClick} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dialog Perfil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src={normalizeAvatarUrl(selectedUser.avatar)}
                  alt={selectedUser.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover"
                />
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
                <Button variant="destructive" className="flex-1">Bloquear</Button>
                <Button variant="secondary" className="flex-1">Remover da rede</Button>
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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddUser())}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)} className="flex-1">
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
