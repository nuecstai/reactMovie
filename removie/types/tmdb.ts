import { Movie } from './movie';

export interface TMDBResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface MovieResponse extends TMDBResponse<Movie> {} 