import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { fetchMoviesByGenre, getImageUrl } from '../services/tmdb';
import Icon from 'react-native-vector-icons/Ionicons';

type CategoriesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Categories'>;

const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - SPACING.md * 4) / 3;

const categories = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const CategoriesScreen = () => {
  const navigation = useNavigation<CategoriesScreenNavigationProp>();
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [movies, setMovies] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const handleCategoryPress = async (categoryId: number) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setMovies([]);
    setHasMore(true);
    await fetchMovies(categoryId, 1);
  };

  const fetchMovies = async (genreId: number, pageNum: number) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const data = await fetchMoviesByGenre(genreId, pageNum);
      if (pageNum === 1) {
        setMovies(data.results);
      } else {
        setMovies(prev => [...prev, ...data.results]);
      }
      setHasMore(data.results.length > 0);
    } catch (error) {
      console.error('Error fetching movies by genre:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore && selectedCategory) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(selectedCategory, nextPage);
    }
  };

  const renderCategoryItem = ({ item }: { item: { id: number; name: string } }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && styles.selectedCategory,
      ]}
      onPress={() => handleCategoryPress(item.id)}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMovieItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => navigation.navigate('MovieDetails', { movie: item })}
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
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.moviesContainer}>
        {selectedCategory ? (
          <FlatList
            data={movies}
            renderItem={renderMovieItem}
            keyExtractor={(item) => item.id.toString()}
            numColumns={3}
            contentContainerStyle={styles.moviesList}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={() => (
              loading ? (
                <ActivityIndicator size="small" color={COLORS.accent} style={styles.loader} />
              ) : null
            )}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text style={styles.placeholderText}>Select a category to view movies</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  categoriesContainer: {
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoriesList: {
    paddingHorizontal: SPACING.sm,
  },
  categoryItem: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xs,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
  },
  selectedCategory: {
    backgroundColor: COLORS.accent,
  },
  categoryText: {
    color: COLORS.text,
    fontSize: 14,
  },
  selectedCategoryText: {
    color: COLORS.background,
    fontWeight: 'bold',
  },
  moviesContainer: {
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
    marginVertical: SPACING.md,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
});

export default CategoriesScreen; 