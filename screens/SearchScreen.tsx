import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { getImageUrl, searchMovies, getTrendingMovies } from '../services/tmdb';
import { Movie } from '../types/movie';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - SPACING.md * 4) / 3;

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'SearchMain'>;

const SearchScreen = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setLoadingTrending(true);
        const movies = await getTrendingMovies();
        setTrendingMovies(movies);
      } catch (error) {
        console.error('Error fetching trending movies:', error);
      } finally {
        setLoadingTrending(false);
      }
    };

    fetchTrendingMovies();
  }, []);

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.length > 2) {
      setLoading(true);
      try {
        const results = await searchMovies(text);
        setSearchResults(results);
      } catch (error) {
        console.error('Error searching movies:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails', { movie });
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

  const renderTrendingItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.trendingItem}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.backdrop_path) }}
        style={styles.trendingImage}
      />
      <View style={styles.trendingContent}>
        <Text style={styles.trendingTitle} numberOfLines={2}>{item.title}</Text>
        <View style={styles.trendingRating}>
          <Icon name="star" size={14} color={COLORS.accent} />
          <Text style={styles.trendingRatingText}>{item.vote_average.toFixed(1)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor={COLORS.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close-circle" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {searchQuery.length > 0 ? (
        <View style={styles.resultsContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
          ) : (
            <FlatList
              data={searchResults}
              renderItem={renderMovieItem}
              keyExtractor={(item) => item.id.toString()}
              numColumns={3}
              contentContainerStyle={styles.moviesList}
              ListEmptyComponent={
                searchQuery.length > 2 ? (
                  <Text style={styles.noResults}>No results found</Text>
                ) : null
              }
            />
          )}
        </View>
      ) : (
        <View style={styles.trendingContainer}>
          <Text style={styles.sectionTitle}>Trending Now</Text>
          {loadingTrending ? (
            <ActivityIndicator size="large" color={COLORS.accent} style={styles.loader} />
          ) : (
            <FlatList
              data={trendingMovies}
              renderItem={renderTrendingItem}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.trendingList}
            />
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.primary,
    margin: SPACING.sm,
    borderRadius: 8,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: SPACING.sm,
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
  loader: {
    flex: 1,
    justifyContent: 'center',
  },
  noResults: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    fontSize: 16,
  },
  trendingContainer: {
    flex: 1,
    padding: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginLeft: SPACING.sm,
  },
  trendingList: {
    paddingBottom: SPACING.md,
  },
  trendingItem: {
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.sm,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  trendingImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  trendingContent: {
    padding: SPACING.sm,
  },
  trendingTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
  trendingRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.xs,
  },
  trendingRatingText: {
    color: COLORS.text,
    fontSize: 14,
    marginLeft: SPACING.xs,
  },
});

export default SearchScreen; 