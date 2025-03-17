export enum MovieStatus {
  TO_WATCH = "to_watch",
  WATCHED = "watched",
}

export interface Movie {
  imdb_id: string;
  title: string;
  year: number;
  poster?: string | null;
  genre: string[];
  director?: string | null;
  actors: string[];
  plot?: string | null;
  type: "movie" | "series";
  rating?: number | null;
  status: MovieStatus;
  score_imdb?: number | null;
  watched_dates: Date[];
  created_at?: string;
}

export type MovieCreateRequest = Omit<Movie, "created_at">;
export type MovieUpdateRequest = Partial<Movie> & { imdb_id: string };
