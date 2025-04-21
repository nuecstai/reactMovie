import { Movie } from '../types/movie';

export type RootStackParamList = {
  HomeTab: undefined;
  SearchTab: undefined;
  ProfileTab: undefined;
  Home: undefined;
  SearchMain: undefined;
  MovieDetails: { movie: Movie };
  Login: undefined;
  SignUp: undefined;
  ProfileMain: undefined;
  Categories: undefined;
  Watchlist: undefined;
  Favorites: undefined;
}; 