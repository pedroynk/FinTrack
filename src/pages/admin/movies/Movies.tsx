"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";
import { deleteMovie, fetchMovies } from "@/api/movies";
import { Movie } from "@/types/movies";
import { MovieCard } from "./components/MovieCard";
import { MovieSearchModal } from "./components/MovieSearchModal";
import Pagination from "../finance/components/Pagination";
import { MovieEditModal } from "./components/MovieEditModal";
import { useToast } from "@/hooks/use-toast";

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"to_watch" | "watched">("to_watch");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(36);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {toast} = useToast();

  useEffect(() => {
    loadMovies();
  }, [filter, page, pageSize]);

  async function loadMovies() {
    const { data, total } = await fetchMovies(filter, page, pageSize);
    setMovies(data);
    setTotalPages(Math.ceil(total / pageSize));
  }

  const handleDeleteMovie = async (imdbId: string) => {
    try {
      await deleteMovie(imdbId);
      toast({
        title: "Sucesso",
        description: "Filme excluído com sucesso!",
        duration: 2000,
      });
      await loadMovies();
    } catch (error) {
      toast({
        title: "Erro",
        description: `Falha ao excluir filme: ${error}`,
        variant: "destructive",
        duration: 2000,
      });
    }
  };
    
  return (
    <div className="p-6">
      {/* Search, Filter & Controls */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="search"
            placeholder="Buscar filmes..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs value={filter} onValueChange={(val) => setFilter(val as "to_watch" | "watched")}>
          <TabsList>
            <TabsTrigger value="to_watch">Para Assistir</TabsTrigger>
            <TabsTrigger value="watched">Assistido</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex gap-2">
          <MovieSearchModal onMovieAdded={loadMovies} />
        </div>
      </div>

      {/* Movie Grid */}
      <div className="grid grid-cols-1 gap-6 grid-cols-3 lg:grid-cols-6">
  {movies
    .filter((movie) => movie.title.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((movie) => (
      <MovieCard 
        key={movie.imdb_id} 
        movie={movie} 
        onClick={() => {
          setSelectedMovie(movie);
          setIsEditModalOpen(true);
        }}
        onDelete={handleDeleteMovie}
      />
    ))}
</div>

    {selectedMovie && (
      <MovieEditModal
        movie={selectedMovie}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onMovieUpdated={loadMovies}
      />
    )}

      {/* Pagination Controls */}
      <Pagination pageSizes={[6, 12, 36, 60]} page={page} pageSize={pageSize} totalPages={totalPages} onSetPage={setPage} onSetPageSize={setPageSize} />
    </div>
  );
}
