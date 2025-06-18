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
  TextInput,
  Modal,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { getImageUrl, getSimilarMovies, getMovieCredits, getMovieVideos, getMovieImages } from '../services/tmdb';
import { Movie, CastMember, Review } from '../types/movie';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../context/AuthContext';
import { addToFavorites, removeFromFavorites, addToWatchlist, removeFromWatchlist, getUserFavorites, getUserWatchlist, addReview, editReview, deleteReview, getReviews } from '../services/userService';
import YoutubePlayer from 'react-native-youtube-iframe';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [reviews, setReviews] = useState<Review[]>([]);
  const [userReview, setUserReview] = useState<{ rating: number; text: string }>({ rating: 0, text: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [videos, setVideos] = useState<any[]>([]);
  const [images, setImages] = useState<any>({ backdrops: [], posters: [] });
  const [loadingMedia, setLoadingMedia] = useState(true);
  const [trailerVisible, setTrailerVisible] = useState(false);

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
        setCast(credits.cast.slice(0, 10));
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

    const fetchReviews = async () => {
      try {
        const fetchedReviews = await getReviews(movie.id);
        setReviews(fetchedReviews);
        if (user) {
          const existing = fetchedReviews.find(r => r.userId === user.uid);
          if (existing) {
            setUserReview({ rating: existing.rating, text: existing.text });
            setIsEditing(true);
          } else {
            setUserReview({ rating: 0, text: '' });
            setIsEditing(false);
          }
        }
      } catch (e) { console.error('Error fetching reviews:', e); }
    };

    const fetchMedia = async () => {
      try {
        setLoadingMedia(true);
        const [vids, imgs] = await Promise.all([
          getMovieVideos(movie.id),
          getMovieImages(movie.id),
        ]);
        setVideos(vids);
        setImages(imgs);
      } catch (e) {
        console.error('Error fetching media:', e);
      } finally {
        setLoadingMedia(false);
      }
    };

    fetchSimilarMovies();
    fetchCast();
    checkUserLists();
    fetchReviews();
    fetchMedia();

    // Save to recently viewed
    (async () => {
      try {
        const key = 'recently_viewed_movies';
        const stored = await AsyncStorage.getItem(key);
        let recent: Movie[] = stored ? JSON.parse(stored) : [];
        // Remove if already exists
        recent = recent.filter(m => m.id !== movie.id);
        // Add to front
        recent.unshift(movie);
        // Limit to 10
        if (recent.length > 10) recent = recent.slice(0, 10);
        await AsyncStorage.setItem(key, JSON.stringify(recent));
      } catch (e) { console.error('Error saving recently viewed:', e); }
    })();
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

  const handleReviewSubmit = async () => {
    if (!user) return;
    try {
      if (isEditing) {
        await editReview(movie.id, user.uid, userReview);
      } else {
        await addReview(movie.id, user.uid, user.email ? user.email.split('@')[0] : 'user', userReview);
      }
      setIsEditing(true);
      const updated = await getReviews(movie.id);
      setReviews(updated);
    } catch (e) { console.error('Error submitting review:', e); }
  };

  const handleReviewDelete = async () => {
    if (!user) return;
    try {
      await deleteReview(movie.id, user.uid);
      setUserReview({ rating: 0, text: '' });
      setIsEditing(false);
      const updated = await getReviews(movie.id);
      setReviews(updated);
    } catch (e) { console.error('Error deleting review:', e); }
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

  // Helper to pick the best trailer
  const getBestTrailer = (videos: any[]) => {
    if (!videos) return null;
    // Prefer official trailers
    const official = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.official);
    if (official) return official;
    // Next, look for a YouTube video with 'official trailer' in the name
    const named = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer' && v.name.toLowerCase().includes('official trailer'));
    if (named) return named;
    // Next, any YouTube trailer
    const anyTrailer = videos.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    if (anyTrailer) return anyTrailer;
    // Fallback: any YouTube video
    return videos.find(v => v.site === 'YouTube');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.backdropContainer}>
        <Image
          source={{ uri: getImageUrl(movie.backdrop_path, 'original') }}
          style={styles.backdrop}
        />
        {/* Overlayed Trailer Button */}
        {(() => {
          const trailer = getBestTrailer(videos);
          if (!trailer) return null;
          return (
            <TouchableOpacity
              style={styles.overlayTrailerButton}
              onPress={() => setTrailerVisible(true)}
              activeOpacity={0.8}
            >
              <Icon name="play-circle" size={32} color={COLORS.accent} style={styles.overlayPlayIcon} />
              <Text style={styles.overlayTrailerText}>Watch Trailer</Text>
            </TouchableOpacity>
          );
        })()}
      </View>
      {/* Trailer Modal */}
      {(() => {
        const trailer = getBestTrailer(videos);
        if (!trailer) return null;
        return (
          <Modal
            visible={trailerVisible}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setTrailerVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity style={styles.closeButton} onPress={() => setTrailerVisible(false)}>
                  <Icon name="close" size={28} color={COLORS.text} />
                </TouchableOpacity>
                <YoutubePlayer
                  height={220}
                  width={340}
                  play={trailerVisible}
                  videoId={trailer.key}
                  onChangeState={event => {
                    if (event === 'ended') setTrailerVisible(false);
                  }}
                />
              </View>
            </View>
          </Modal>
        );
      })()}
      
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
              color={isFavorite ? '#FFD700' : COLORS.text}
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
              color={isInWatchlist ? '#FFD700' : COLORS.text}
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

        {/* Image Gallery Section */}
      {loadingMedia ? null : images && images.backdrops && images.backdrops.length > 0 ? (
        <View style={{ marginBottom: 16 }}>
          <Text style={styles.sectionTitle}>Gallery</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            {images.backdrops.slice(0, 10).map((img: any, idx: number) => (
              <Image
                key={idx}
                source={{ uri: getImageUrl(img.file_path, 'w500') }}
                style={{ width: 180, height: 100, borderRadius: 8, marginRight: 10 }}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

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

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          {user && (
            <View style={styles.reviewForm}>
              <Text style={styles.reviewFormLabel}>{isEditing ? 'Edit your review' : 'Write a review'}</Text>
              <View style={styles.starsRow}>
                {[1,2,3,4,5].map(star => (
                  <TouchableOpacity key={star} onPress={() => setUserReview(prev => ({ ...prev, rating: star }))}>
                    <Icon name={userReview.rating >= star ? 'star' : 'star-outline'} size={28} color={COLORS.accent} />
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput
                style={styles.reviewInput}
                placeholder="Share your thoughts..."
                placeholderTextColor={COLORS.textSecondary}
                value={userReview.text}
                onChangeText={text => setUserReview(prev => ({ ...prev, text }))}
                multiline
              />
              <View style={styles.reviewFormActions}>
                <TouchableOpacity style={styles.reviewButton} onPress={handleReviewSubmit}>
                  <Text style={styles.reviewButtonText}>{isEditing ? 'Update' : 'Submit'}</Text>
                </TouchableOpacity>
                {isEditing && (
                  <TouchableOpacity style={[styles.reviewButton, styles.deleteButton]} onPress={handleReviewDelete}>
                    <Icon name="trash" size={20} color={COLORS.background} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
          {reviews.length === 0 && <Text style={styles.noReviews}>No reviews yet.</Text>}
          {reviews.map(review => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUsername}>{review.username}</Text>
                <View style={styles.reviewStars}>
                  {[1,2,3,4,5].map(star => (
                    <Icon key={star} name={review.rating >= star ? 'star' : 'star-outline'} size={16} color={COLORS.accent} />
                  ))}
                </View>
              </View>
              <Text style={styles.reviewText}>{review.text}</Text>
              <Text style={styles.reviewDate}>{new Date(review.createdAt).toLocaleDateString()}</Text>
            </View>
          ))}
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
  backdropContainer: {
    position: 'relative',
  },
  backdrop: {
    width: screenWidth,
    height: screenWidth * 0.6,
    resizeMode: 'cover',
  },
  overlayTrailerButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  overlayPlayIcon: {
    marginRight: 6,
    fontSize: 32,
  },
  overlayTrailerText: {
    color: COLORS.accent,
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: COLORS.background,
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
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
  reviewSection: {
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  reviewForm: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  reviewFormLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
    justifyContent: 'center',
  },
  reviewInput: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.sm,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    minHeight: 60,
    backgroundColor: COLORS.background,
  },
  reviewFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  reviewButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  reviewButtonText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    marginLeft: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  noReviews: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  reviewItem: {
    marginBottom: SPACING.md,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.card,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  reviewUsername: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: 'bold',
  },
  reviewStars: {
    flexDirection: 'row',
  },
  reviewText: {
    color: COLORS.text,
    fontSize: 15,
    marginBottom: SPACING.xs,
    marginTop: 2,
  },
  reviewDate: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'right',
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
  trailerSection: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  trailerCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  trailerButtonSection: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  trailerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 24,
    shadowColor: COLORS.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 2,
  },
  trailerButtonText: {
    color: COLORS.accent,
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    padding: 0,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
    zIndex: 2,
  },
  trailerWebview: {
    width: '100%',
    aspectRatio: 16 / 9,
    minHeight: 200,
    maxHeight: 300,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    marginBottom: 16,
  },
});

export default MovieDetailsScreen;