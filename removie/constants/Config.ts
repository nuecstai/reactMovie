import Constants from 'expo-constants';

// Get TMDB API key from environment variables
export const TMDB_API_KEY = Constants.expoConfig?.extra?.tmdbApiKey || process.env.TMDB_API_KEY || '';
export const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

export const COLORS = {
  primary: '#1a1a1a',
  secondary: '#2a2a2a',
  accent: '#e50914',
  text: '#ffffff',
  textSecondary: '#b3b3b3',
  background: '#121212',
  card: '#1e1e1e',
  border: '#333333',
  danger: '#FF3B30',
};

export const FONTS = {
  regular: 'System',
  bold: 'System',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};