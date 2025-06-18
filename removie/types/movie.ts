export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres?: Genre[];
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MovieCredits {
  cast: CastMember[];
  crew: any[];
}

export interface Review {
  id: string;
  userId: string;
  username: string;
  rating: number; // 1-5
  text: string;
  createdAt: number; // timestamp
}