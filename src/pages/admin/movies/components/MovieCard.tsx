// components/MovieCard.tsx
import { Trash2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Movie } from "@/types/movies";

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
  onDelete: (imdbId: string) => Promise<void>;
}

export function MovieCard({ movie, onClick, onDelete }: MovieCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(movie.imdb_id);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="relative group cursor-pointer" onClick={onClick}>
      {/* Botão de Delete */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleteDialogOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <p>Tem certeza que deseja excluir {movie.title}?</p>
          <div className="flex gap-2 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Badge de Avaliação */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/80 text-white px-2 py-1 rounded-md">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="text-sm font-medium">
          {movie.status === 'watched' 
            ? movie.rating ?? 'N/A'
            : movie.score_imdb}
        </span>
      </div>

      {/* Conteúdo normal do card */}
      <img
        src={movie.poster || "/placeholder.svg"}
        alt={movie.title}
        className="w-full h-auto md:h-48 object-cover rounded-lg"
      />
      <div className="mt-2">
        <h3 className="font-medium">{movie.title}</h3>
        <p className="text-sm text-gray-500">{movie.year}</p>
      </div>
    </div>
  );
}