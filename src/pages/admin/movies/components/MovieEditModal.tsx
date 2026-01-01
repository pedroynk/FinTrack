"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { updateMovie } from "@/api/movies";
import { Movie, MovieStatus, MovieUpdateRequest } from "@/types/movies";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/DatePicker";

interface MovieEditModalProps {
  movie: Movie;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMovieUpdated: () => void;
}

export function MovieEditModal({ movie, open, onOpenChange, onMovieUpdated }: MovieEditModalProps) {
  const [rating, setRating] = useState<number | "">(movie.rating ?? "");
  const [watchedDate, setWatchedDate] = useState<Date | undefined>();
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleSave() {
    try {
      setLoading(true);

      if (movie.status === MovieStatus.TO_WATCH && !watchedDate) {
        toast({
          title: "Erro",
          description: "Por favor, selecione uma data",
          variant: "destructive",
          duration: 2000,
        });
        return;
      }

      const updateData: MovieUpdateRequest = {
        ...movie,
        rating: rating !== "" ? Number(rating) : null,
        ...(watchedDate && {
          watched_dates: [...movie.watched_dates, watchedDate],
          status: MovieStatus.WATCHED
        })
      };

      await updateMovie(updateData);

      toast({
        title: "Sucesso",
        description: "Filme atualizado com sucesso!",
        duration: 2000,
      });

      onOpenChange(false);
      onMovieUpdated();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao atualizar filme: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
        <DialogTitle>Editar Filme</DialogTitle>

        <div className="flex items-start gap-3 sm:gap-4">
          <img
            src={movie.poster || "/placeholder.svg"}
            alt={movie.title}
            className="h-20 w-14 flex-none rounded object-cover sm:h-24 sm:w-16"
          />
          <div className="min-w-0">
            <h3 className="truncate text-base font-medium sm:text-lg">
              {movie.title} ({movie.year})
            </h3>
            <p className="truncate text-sm text-muted-foreground">{movie.imdb_id}</p>
          </div>
        </div>


        <div className="space-y-4">
          {movie.status === MovieStatus.TO_WATCH ? (
            <>
              <Input
                type="number"
                placeholder="Nota (0-10)"
                min="0"
                max="10"
                value={rating}
                onChange={(e) => setRating(e.target.value ? Number(e.target.value) : "")}
              />
              <DatePicker
                date={watchedDate}
                onSelect={setWatchedDate}
                placeholder="Data que assistiu"
              />
            </>
          ) : (
            <DatePicker
              date={watchedDate}
              onSelect={setWatchedDate}
              placeholder="Adicionar nova data assistida"
            />
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button variant="outline" className="w-full sm:flex-1" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave} disabled={loading} className="w-full sm:flex-1">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}