import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { getImageUrl, getSimilarMovies, getMovieCredits } from '../services/tmdb';
import { Movie, CastMember } from '../types/movie';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { addToFavorites, removeFromFavorites, addToWatchlist, removeFromWatchlist, getUserFavorites, getUserWatchlist } from '../services/userService';

const { width: screenWidth } = Dimensions.get('window');
const CAST_ITEM_WIDTH = 80;

type MovieDetailsScreenProps = {
  route: {
    params: {
      movie: Movie;
    };
  };
};

const MovieDetailsScreen = ({ route }: MovieDetailsScreenProps) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const { movie } = route.params;
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [loadingCast, setLoadingCast] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      try {
        setIsLoadingSimilar(true);
        const movies = await getSimilarMovies(movie.id);
        setSimilarMovies(movies);
      } catch (error) {
        console.error('Error fetching similar movies:', error);
      } finally {
        setIsLoadingSimilar(false);
      }
    };

    const fetchCast = async () => {
      try {
        setLoadingCast(true);
        const credits = await getMovieCredits(movie.id);
        setCast(credits.cast.slice(0, 10)); // Get top 10 cast members
      } catch (error) {
        console.error('Error fetching cast:', error);
      } finally {
        setLoadingCast(false);
      }
    };

    const checkUserLists = async () => {
      if (user) {
        try {
          const favorites = await getUserFavorites(user.uid);
          const watchlist = await getUserWatchlist(user.uid);
          setIsFavorite(favorites.some((fav: Movie) => fav.id === movie.id));
          setIsInWatchlist(watchlist.some((item: Movie) => item.id === movie.id));
        } catch (error) {
          console.error('Error checking user lists:', error);
        }
      }
    };

    fetchSimilarMovies();
    fetchCast();
    checkUserLists();
  }, [movie.id, user]);

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movie });
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to add movies to your favorites.",
        [
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      if (isFavorite) {
        await removeFromFavorites(user.uid, movie.id);
        setIsFavorite(false);
      } else {
        await addToFavorites(user.uid, movie);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert("Error", "Failed to update favorites. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWatchlist = async () => {
    if (!user) {
      Alert.alert(
        "Login Required",
        "Please log in to add movies to your watchlist.",
        [
          {
            text: "OK",
            style: "cancel"
          }
        ]
      );
      return;
    }

    try {
      setIsLoading(true);
      if (isInWatchlist) {
        await removeFromWatchlist(user.uid, movie.id);
        setIsInWatchlist(false);
      } else {
        await addToWatchlist(user.uid, movie);
        setIsInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      Alert.alert("Error", "Failed to update watchlist. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderMovieCard = (item: Movie) => (
    <TouchableOpacity 
      style={styles.similarMovieItem} 
      key={item.id}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.similarMoviePoster}
      />
      <Text style={styles.similarMovieTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  const renderCastItem = ({ item }: { item: CastMember }) => (
    <View style={styles.castItem}>
      <Image
        source={{ uri: item.profile_path ? getImageUrl(item.profile_path, 'w185') : 'https://via.placeholder.com/80x120' }}
        style={styles.castImage}
      />
      <Text style={styles.castName} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.castCharacter} numberOfLines={2}>{item.character}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
        style={styles.backdrop}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{movie.title}</Text>
          <View style={styles.ratingContainer}>
            <Icon name="star" size={20} color={COLORS.accent} />
            <Text style={styles.rating}>{movie.vote_average.toFixed(1)}</Text>
            <Text style={styles.releaseDate}>{movie.release_date.split('-')[0]}</Text>
          </View>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, isFavorite && styles.activeButton]}
            onPress={toggleFavorite}
          >
            <Icon 
              name={isFavorite ? "heart" : "heart-outline"} 
              size={24} 
              color={isFavorite ? COLORS.accent : COLORS.text} 
            />
            <Text style={[styles.actionButtonText, isFavorite && styles.activeButtonText]}>
              Favorite
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, isInWatchlist && styles.activeButton]}
            onPress={toggleWatchlist}
          >
            <Icon 
              name={isInWatchlist ? "bookmark" : "bookmark-outline"} 
              size={24} 
              color={isInWatchlist ? COLORS.accent : COLORS.text} 
            />
            <Text style={[styles.actionButtonText, isInWatchlist && styles.activeButtonText]}>
              Watchlist
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.overviewContainer}>
          <Text style={styles.overviewTitle}>Overview</Text>
          <Text style={styles.overview}>{movie.overview}</Text>
        </View>

        <View style={styles.castContainer}>
          <Text style={styles.sectionTitle}>Cast</Text>
          {loadingCast ? (
            <ActivityIndicator size="small" color={COLORS.accent} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.castList}
            >
              {cast.map((item) => (
                <View key={item.id} style={styles.castItem}>
                  <Image
                    source={{ uri: item.profile_path ? getImageUrl(item.profile_path, 'w185') : 'https://via.placeholder.com/80x120' }}
                    style={styles.castImage}
                  />
                  <Text style={styles.castName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.castCharacter} numberOfLines={2}>{item.character}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {similarMovies.length > 0 && (
          <View style={styles.similarMoviesContainer}>
            <Text style={styles.sectionTitle}>Similar Movies</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarMoviesList}
            >
              {similarMovies.map((movie) => renderMovieCard(movie))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  backdrop: {
    width: screenWidth,
    height: screenWidth * 0.6,
    resizeMode: 'cover',
  },
  content: {
    padding: SPACING.md,
  },
  header: {
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: SPACING.sm,
  },
  releaseDate: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginLeft: SPACING.sm,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  activeButton: {
    backgroundColor: COLORS.accent,
  },
  actionButtonText: {
    color: COLORS.text,
    marginLeft: SPACING.xs,
    fontSize: 14,
  },
  activeButtonText: {
    color: COLORS.background,
  },
  overviewContainer: {
    marginBottom: SPACING.lg,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  overview: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'justify',
  },
  castContainer: {
    marginBottom: SPACING.lg,
  },
  castList: {
    paddingRight: SPACING.md,
  },
  castItem: {
    width: CAST_ITEM_WIDTH,
    marginRight: SPACING.md,
  },
  castImage: {
    width: CAST_ITEM_WIDTH,
    height: CAST_ITEM_WIDTH * 1.5,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  castName: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  castCharacter: {
    color: COLORS.textSecondary,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
  similarMoviesContainer: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  similarMoviesList: {
    paddingRight: SPACING.md,
  },
  similarMovieItem: {
    width: 150,
    marginRight: SPACING.md,
  },
  similarMoviePoster: {
    width: 150,
    height: 225,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  similarMovieTitle: {
    color: COLORS.text,
    marginTop: SPACING.xs,
    fontSize: 14,
    width: 150,
  },
});

export default MovieDetailsScreen; 