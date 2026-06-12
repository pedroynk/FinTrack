import { Movie, MovieStatus } from "@/types/movies";

const API_URL = "https://www.omdbapi.com/";
const API_KEY = import.meta.env.VITE_OMDB_API_KEY;

interface OmdbSearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: "movie" | "series";
}

interface OmdbSearchResponse {
  Search?: OmdbSearchResult[];
  Response: "True" | "False";
  Error?: string;
}

interface OmdbMovieResponse extends OmdbSearchResult {
  Genre?: string;
  Director?: string;
  Actors?: string;
  Plot?: string;
  imdbRating?: string;
}

// Fetch movie by IMDb ID
export async function fetchMovieByImdbId(imdbId: string): Promise<Movie | null> {
  try {
    const res = await fetch(`${API_URL}?i=${imdbId}&apikey=${API_KEY}`);
    const movie = (await res.json()) as OmdbMovieResponse & {
      Response?: "True" | "False";
    };

    if (movie.Response === "False") return null;

    return formatMovie(movie);
  } catch (error) {
    console.error("Error fetching movie by IMDb ID:", error);
    return null;
  }
}

// Search movies by title
export async function searchMovies(query: string): Promise<Movie[]> {
  try {
    const res = await fetch(
      `${API_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`
    );
    const searchResults = (await res.json()) as OmdbSearchResponse;

    if (!searchResults.Search) return [];

    return searchResults.Search.map((result) => ({
      imdb_id: result.imdbID,
      title: result.Title,
      year: parseInt(result.Year, 10),
      poster: result.Poster !== "N/A" ? result.Poster : null,
      genre: [], // Search API does not return genre
      director: null, // Search API does not return director
      actors: [], // Search API does not return actors
      plot: null, // Search API does not return plot
      type: result.Type as "movie" | "series",
      rating: null, // Search API does not return IMDb rating
      score_imdb: null, // Search API does not return IMDb rating
      watched_dates: [],
      status: MovieStatus.TO_WATCH,
    }));
  } catch (error) {
    console.error("Error searching movies:", error);
    return [];
  }
}

// Format API response to match Movie type
function formatMovie(movie: OmdbMovieResponse): Movie {
  const actors = movie.Actors && movie.Actors !== "N/A"
    ? movie.Actors.split(", ")
    : [];

  return {
    imdb_id: movie.imdbID,
    title: movie.Title,
    year: parseInt(movie.Year, 10),
    poster: movie.Poster !== "N/A" ? movie.Poster : null,
    genre: movie.Genre ? movie.Genre.split(", ").filter(Boolean) : [],
    director: movie.Director !== "N/A" ? movie.Director : null,
    actors,
    plot: movie.Plot !== "N/A" ? movie.Plot : null,
    type: movie.Type as "movie" | "series",
    rating: null,
    score_imdb: movie.imdbRating && movie.imdbRating !== "N/A"
      ? parseFloat(movie.imdbRating)
      : null,
    status: MovieStatus.TO_WATCH,
    watched_dates: [],
  };
}
