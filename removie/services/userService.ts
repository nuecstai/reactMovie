import { db } from '../config/firebase';
import { doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove, FirestoreError } from 'firebase/firestore';
import { Movie, Review } from '../types/movie';
import { collection, getDocs, deleteDoc } from 'firebase/firestore';

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

// Add a review for a movie
export const addReview = async (movieId: number, userId: string, username: string, review: { rating: number; text: string }) => {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, `movies/${movieId}/reviews`, reviewId);
    const newReview: Review = {
      id: reviewId,
      userId,
      username,
      rating: review.rating,
      text: review.text,
      createdAt: Date.now(),
    };
    await setDoc(reviewRef, newReview);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error adding review:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

// Edit a review
export const editReview = async (movieId: number, userId: string, review: { rating: number; text: string }) => {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, `movies/${movieId}/reviews`, reviewId);
    await updateDoc(reviewRef, {
      rating: review.rating,
      text: review.text,
      createdAt: Date.now(),
    });
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error editing review:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

// Delete a review
export const deleteReview = async (movieId: number, userId: string) => {
  try {
    const reviewId = `${userId}_${movieId}`;
    const reviewRef = doc(db, `movies/${movieId}/reviews`, reviewId);
    await deleteDoc(reviewRef);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error deleting review:', firestoreError.code, firestoreError.message);
    throw error;
  }
};

// Get all reviews for a movie
export const getReviews = async (movieId: number): Promise<Review[]> => {
  try {
    const reviewsRef = collection(db, `movies/${movieId}/reviews`);
    const reviewsSnapshot = await getDocs(reviewsRef);
    return reviewsSnapshot.docs.map(doc => doc.data() as Review);
  } catch (error) {
    const firestoreError = error as FirestoreError;
    console.error('Error fetching reviews:', firestoreError.code, firestoreError.message);
    throw error;
  }
};