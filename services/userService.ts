import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, FirestoreError } from 'firebase/firestore';
import { Movie } from '../types/movie';

export const addToFavorites = async (userId: string, movie: Movie) => {
  try {
    console.log('Adding to favorites:', userId, movie.id);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('Creating new user document for favorites');
      await setDoc(userRef, {
        favorites: [movie],
        watchlist: []
      });
    } else {
      console.log('Updating existing user favorites');
      await updateDoc(userRef, {
        favorites: arrayUnion(movie)
      });
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error adding to favorites:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

export const removeFromFavorites = async (userId: string, movieId: number) => {
  try {
    console.log('Removing from favorites:', userId, movieId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const favorites = userDoc.data().favorites || [];
      const updatedFavorites = favorites.filter((movie: Movie) => movie.id !== movieId);
      
      await updateDoc(userRef, {
        favorites: updatedFavorites
      });
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error removing from favorites:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

export const addToWatchlist = async (userId: string, movie: Movie) => {
  try {
    console.log('Adding to watchlist:', userId, movie.id);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      console.log('Creating new user document for watchlist');
      await setDoc(userRef, {
        favorites: [],
        watchlist: [movie]
      });
    } else {
      console.log('Updating existing user watchlist');
      await updateDoc(userRef, {
        watchlist: arrayUnion(movie)
      });
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error adding to watchlist:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

export const removeFromWatchlist = async (userId: string, movieId: number) => {
  try {
    console.log('Removing from watchlist:', userId, movieId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const watchlist = userDoc.data().watchlist || [];
      const updatedWatchlist = watchlist.filter((movie: Movie) => movie.id !== movieId);
      
      await updateDoc(userRef, {
        watchlist: updatedWatchlist
      });
    }
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error removing from watchlist:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

export const getUserFavorites = async (userId: string): Promise<Movie[]> => {
  try {
    console.log('Getting user favorites:', userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().favorites || [];
    }
    return [];
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error getting favorites:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

export const getUserWatchlist = async (userId: string): Promise<Movie[]> => {
  try {
    console.log('Getting user watchlist:', userId);
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data().watchlist || [];
    }
    return [];
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error getting watchlist:', firestoreError.code, firestoreError.message);
    throw error;
  }
}; 