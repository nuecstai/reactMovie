import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { getTopRatedMovies, getImageUrl, getMovieDetails } from '../services/tmdb';
import { Movie } from '../types/movie';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - SPACING.md * 4) / 3;

const TopRatedScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMovies(1);
    setPage(1);
  }, []);

  const fetchMovies = async (pageNum: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await getTopRatedMovies(pageNum);
      if (pageNum === 1) {
        setMovies(response.results);
      } else {
        setMovies(prev => [...prev, ...response.results]);
      }
      setHasMore(response.page < response.total_pages);
    } catch (error) {
      console.error('Error fetching top rated movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(nextPage);
    }
  };

  const handleMoviePress = async (movie: Movie) => {
    try {
      const movieDetails = await getMovieDetails(movie.id);
      navigation.navigate('MovieDetails', { movie: movieDetails });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.moviePoster}
      />
      <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
      <View style={styles.ratingContainer}>
        <Icon name="star" size={12} color={COLORS.accent} />
        <Text style={styles.rating}>{item.vote_average.toFixed(1)}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={movies}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        numColumns={3}
        contentContainerStyle={styles.moviesList}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color={COLORS.accent} /> : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  moviesList: {
    paddingBottom: SPACING.md,
  },
  movieItem: {
    width: ITEM_WIDTH,
    margin: SPACING.xs,
  },
  moviePoster: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.5,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
  },
  movieTitle: {
    color: COLORS.text,
    fontSize: 12,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xs,
  },
  rating: {
    color: COLORS.text,
    fontSize: 12,
    marginLeft: SPACING.xs,
  },
});

export default TopRatedScreen;
