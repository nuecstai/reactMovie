import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { getPopularMovies, getTopRatedMovies, getUpcomingMovies, getImageUrl, getMovieDetails } from '../services/tmdb';
import { Movie } from '../types/movie';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const { width: screenWidth } = Dimensions.get('window');

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setIsLoading(true);
        const [popular, topRated, upcoming] = await Promise.all([
          getPopularMovies(),
          getTopRatedMovies(),
          getUpcomingMovies(),
        ]);
        // Limit popular movies to 8
        setPopularMovies(popular.slice(0, 8));
        setTopRatedMovies(topRated);
        setUpcomingMovies(upcoming);
      } catch (error) {
        console.error('Error fetching movies:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  useEffect(() => {
    if (popularMovies.length > 0) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === popularMovies.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [popularMovies]);

  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? popularMovies.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === popularMovies.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleMoviePress = async (movie: Movie) => {
    try {
      const movieDetails = await getMovieDetails(movie.id);
      navigation.navigate('MovieDetails', { movie: movieDetails });
    } catch (error) {
      console.error('Error fetching movie details:', error);
    }
  };

  const renderMovieCard = (item: Movie) => (
    <TouchableOpacity 
      style={styles.movieCard} 
      key={item.id}
      onPress={() => handleMoviePress(item)}
    >
      <Image
        source={{ uri: getImageUrl(item.poster_path) }}
        style={styles.moviePoster}
      />
      <Text style={styles.movieTitle} numberOfLines={2}>{item.title}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>reMovie</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
          <Icon name="menu" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {popularMovies.length > 0 && (
        <View style={styles.carouselContainer}>
          <View style={styles.carouselWrapper}>
            {popularMovies.map((movie, index) => (
              <TouchableOpacity
                key={movie.id}
                style={[
                  styles.carouselItem,
                  { display: index === currentIndex ? 'flex' : 'none' }
                ]}
                onPress={() => handleMoviePress(movie)}
              >
                <Image
                  source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
                  style={styles.carouselImage}
                />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselTitle}>{movie.title}</Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.navButton, styles.prevButton]}
              onPress={handlePrevious}
            >
              <Icon name="chevron-back" size={30} color={COLORS.text} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.navButton, styles.nextButton]}
              onPress={handleNext}
            >
              <Icon name="chevron-forward" size={30} color={COLORS.text} />
            </TouchableOpacity>
            <View style={styles.pagination}>
              {popularMovies.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.paginationDot,
                    index === currentIndex && styles.paginationDotActive
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      )}

      {topRatedMovies.length > 0 && (
        <View style={styles.topRatedContainer}>
          <Text style={styles.sectionTitle}>Top Rated Movies</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {topRatedMovies.map(renderMovieCard)}
          </ScrollView>
        </View>
      )}

      {upcomingMovies.length > 0 && (
        <View style={styles.upcomingContainer}>
          <Text style={styles.sectionTitle}>Upcoming Movies</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {upcomingMovies.map(renderMovieCard)}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: COLORS.primary,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  menuButton: {
    fontSize: 24,
    color: COLORS.text,
  },
  carouselContainer: {
    marginVertical: SPACING.md,
    marginBottom: SPACING.xs,
  },
  carouselWrapper: {
    height: 300,
    position: 'relative',
    marginTop: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: SPACING.md,
    marginBottom: SPACING.md,
  },
  carouselItem: {
    width: '100%',
    height: 300,
    borderRadius: 10,
    overflow: 'hidden',
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: SPACING.md,
  },
  carouselTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  carouselDescription: {
    color: COLORS.text,
    fontSize: 14,
    opacity: 0.8,
  },
  navButton: {
    position: 'absolute',
    top: '50%',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [{ translateY: -20 }],
  },
  prevButton: {
    left: 10,
  },
  nextButton: {
    right: 10,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: COLORS.accent,
  },
  topRatedContainer: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
  horizontalScroll: {
    paddingRight: SPACING.md,
  },
  movieCard: {
    width: 150,
    marginRight: SPACING.md,
  },
  moviePoster: {
    width: 150,
    height: 225,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  movieTitle: {
    color: COLORS.text,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xs,
    fontSize: 14,
    width: 150,
  },
  upcomingContainer: {
    padding: SPACING.md,
    marginTop: SPACING.xs,
  },
});

export default HomeScreen; 