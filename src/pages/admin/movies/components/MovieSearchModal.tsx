import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { fetchMovieByImdbId, searchMovies } from "@/lib/omdb";
import { createMovie } from "@/api/movies";
import { Movie, MovieCreateRequest, MovieStatus } from "@/types/movies";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/DatePicker";

interface MovieSearchModalProps {
  onMovieAdded: () => void;
}

export function MovieSearchModal({ onMovieAdded }: MovieSearchModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"search" | "details">("search");
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [rating, setRating] = useState<number | "">("");
  const [watchedDate, setWatchedDate] = useState<Date>();

  const [status, setStatus] = useState<"watched" | "to_watch">("to_watch");
  const { toast } = useToast();

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);

    let results: Movie[] = [];
    if (/^tt\d+$/.test(query)) {
      const movie = await fetchMovieByImdbId(query);
      if (movie) results = [movie];
    } else {
      results = await searchMovies(query);
    }

    setSearchResults(results);
    setLoading(false);
  }

  async function handleSelectMovie(movie: Movie) {
    setLoading(true);
    const fullMovie = await fetchMovieByImdbId(movie.imdb_id);
    

    if (!fullMovie) {
      setLoading(false);
      toast({
        title: "Erro",
        description: "Falha ao buscar detalhes do filme.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    setSelectedMovie(fullMovie);
    setStep("details");
    setLoading(false);
  }

  async function handleSaveMovie() {
    if (!selectedMovie) return;

    if (status === "watched" && !watchedDate) {
      toast({
        title: "Erro",
        description: "Por favor, informe a data em que assistiu o filme.",
        variant: "destructive",
        duration: 2000,
      });
      return;
    }

    const newMovie: MovieCreateRequest = {
      ...selectedMovie,
      status: status === "watched" ? MovieStatus.WATCHED : MovieStatus.TO_WATCH,
      rating: status === "watched" ? (rating !== "" ? Number(rating) : null) : null,
      watched_dates: status === "watched" && watchedDate ? [watchedDate] : [],
    };

    try {
      await createMovie(newMovie);
      toast({
        title: "Sucesso",
        description: "Filme adicionado com sucesso!",
        duration: 2000,
      });
      setIsOpen(false);
      onMovieAdded();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao adicionar filme: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  }

  function resetState() {
    setStep("search");
    setQuery("");
    setSearchResults([]);
    setSelectedMovie(null);
    setRating("");
    setWatchedDate(new Date());
    setStatus("to_watch");
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetState();
    }}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Adicionar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogTitle>
          {step === "search" ? "Buscar Filme" : "Adicionar Detalhes"}
        </DialogTitle>

        {step === "search" ? (
          <>
            <Input
              type="text"
              placeholder="Digite o IMDb ID ou o título..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button 
              onClick={handleSearch} 
              disabled={loading}
              className="w-full"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>

            {searchResults.length > 0 && (
              <div className="max-h-auto md:h-[300px] overflow-y-auto space-y-2">
                {searchResults.map((movie) => (
                  <div
                    key={movie.imdb_id}
                    className="flex items-center gap-4 p-2 hover:bg-gray-100 rounded cursor-pointer"
                    onClick={() => handleSelectMovie(movie)}
                  >
                    <img 
                      src={movie.poster || "/placeholder.svg"} 
                      alt={movie.title} 
                      className="w-full md:w-10 h-auto md:h-15 object-cover"
                    />
                    <div>
                      <p className="font-medium">{movie.title} ({movie.year})</p>
                      <p className="text-sm text-gray-500">IMDB ID: {movie.imdb_id}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-4">
              <img 
                src={selectedMovie?.poster || "/placeholder.svg"} 
                alt={selectedMovie?.title} 
                className="w-full md:w-20 h-auto md:h-30 object-cover"
              />
              <div>
                <h3 className="font-medium text-lg">{selectedMovie?.title} ({selectedMovie?.year})</h3>
                <p className="text-sm text-gray-500">{selectedMovie?.imdb_id}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Button
                  variant={status === "to_watch" ? "default" : "outline"}
                  onClick={() => setStatus("to_watch")}
                >
                  Para Assistir
                </Button>
                <Button
                  variant={status === "watched" ? "default" : "outline"}
                  onClick={() => setStatus("watched")}
                >
                  Assistido
                </Button>
              </div>

              {status === "watched" && (
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
                  />
                  {!watchedDate && (
                    <p className="text-sm text-destructive">Por favor selecione uma data</p>
                  )}
                </>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("search")}
                >
                  Voltar
                </Button>
                <Button
                  onClick={handleSaveMovie}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Salvando..." : "Salvar Filme"}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}