import axios from 'axios';
import { TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_BASE_URL } from '../constants/Config';
import { MovieResponse } from '../types/tmdb';
import { Movie } from '../types/movie';

const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const getPopularMovies = async () => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/popular');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getTopRatedMovies = async () => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/top_rated');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

export const getUpcomingMovies = async () => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/movie/upcoming');
    return response.data.results;
  } catch (error) {
    console.error('Error fetching upcoming movies:', error);
    throw error;
  }
};

export const searchMovies = async (query: string) => {
  try {
    const response = await tmdbApi.get<MovieResponse>('/search/movie', {
      params: { query },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
  try {
    const response = await tmdbApi.get<Movie>(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

export const getImageUrl = (path: string, size: string = 'w500') => {
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getSimilarMovies = async (movieId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get<MovieResponse>(`/movie/${movieId}/similar`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

export const fetchMoviesByGenre = async (genreId: number, page: number = 1, sortBy: string = 'popularity.desc') => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}&sort_by=${sortBy}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

export const getMovieCredits = async (movieId: number) => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/movie/day?api_key=${TMDB_API_KEY}`
    );
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    throw error;
  }
};
