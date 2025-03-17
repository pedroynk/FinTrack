import { supabase } from "@/lib/supabase";
import { Movie, MovieCreateRequest, MovieUpdateRequest } from "@/types/movies";

/**
 * Supabase Functions for `movies` Table
 */

// Fetch all movies stored in Supabase
export async function fetchMovies(status: "to_watch" | "watched", page: number, pageSize: number): Promise<{ data: Movie[]; total: number }> {
  const { data, error, count } = await supabase
    .from("movie")
    .select("*", { count: "exact" })
    .eq("status", status)
    .order(status === "watched" ? "watched_dates" : "year", { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (error) throw new Error(error.message);
  return { data: data || [], total: count || 0 };
}


// Fetch a single movie by IMDb ID
export async function fetchMovieById(imdbId: string): Promise<Movie | null> {
  const { data, error } = await supabase.from("movie").select("*").eq("imdb_id", imdbId).single();

  if (error) return null;
  return data;
}

// Add a new movie to Supabase
export async function createMovie(movie: MovieCreateRequest): Promise<void> {
  const { error } = await supabase.from("movie").insert([movie]);

  if (error) throw new Error(error.message);
}

// Update movie details in Supabase
export async function updateMovie(updateData: MovieUpdateRequest): Promise<void> {
  const { imdb_id, ...updateFields } = updateData;

  const { error } = await supabase.from("movie").update(updateFields).eq("imdb_id", imdb_id);

  if (error) throw new Error(error.message);
}

// Delete a movie from Supabase
export async function deleteMovie(imdbId: string): Promise<void> {
  const { error } = await supabase.from("movie").delete().eq("imdb_id", imdbId);

  if (error) throw new Error(error.message);
}
