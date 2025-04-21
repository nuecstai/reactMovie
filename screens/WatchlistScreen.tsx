import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import { getUserWatchlist } from '../services/userService';
import { Movie } from '../types/movie';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type WatchlistScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const WatchlistScreen = () => {
  const { user } = useAuth();
  const [watchlist, setWatchlist] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<WatchlistScreenNavigationProp>();

  useEffect(() => {
    const loadWatchlist = async () => {
      if (user) {
        try {
          const userWatchlist = await getUserWatchlist(user.uid);
          setWatchlist(userWatchlist);
        } catch (error) {
          console.error('Error loading watchlist:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadWatchlist();
  }, [user]);

  const renderMovieItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieItem}
      onPress={() => navigation.navigate('MovieDetails', { movie: item })}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.moviePoster}
      />
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle}>{item.title}</Text>
        <Text style={styles.movieYear}>
          {new Date(item.release_date).getFullYear()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  if (watchlist.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No movies in your watchlist yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={watchlist}
        renderItem={renderMovieItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContainer: {
    padding: SPACING.md,
  },
  movieItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginBottom: SPACING.md,
    borderRadius: 8,
    overflow: 'hidden',
  },
  moviePoster: {
    width: 100,
    height: 150,
  },
  movieInfo: {
    flex: 1,
    padding: SPACING.md,
    justifyContent: 'center',
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  movieYear: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xl,
  },
});

export default WatchlistScreen; 