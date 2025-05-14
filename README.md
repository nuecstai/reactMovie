# reMovie - Movie Review App

A React Native mobile application for browsing, reviewing, and rating movies. Built with Expo, TMDB API, and Firebase (Firestore) for user management and reviews.

## Features

- Browse popular, top-rated, and upcoming movies
- Search for movies
- Detailed movie info (overview, cast, similar movies)
- User authentication (Firebase)
- Favorites and watchlist functionality
- Write, edit, and delete your own movie reviews
- Rate movies (1-5 stars) and see all user reviews for each movie
- Dark theme UI

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- TMDB API key
- Firebase project (for Firestore and Auth)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/reactMovie.git
   cd reMovie
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory and add your TMDB API key:
   ```
   TMDB_API_KEY=your_api_key_here
   ```
4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password recommended)
   - Enable Firestore Database
   - Download your Firebase config and update `config/firebase.ts`
   - Set Firestore rules (see below)

5. Start the development server:
   ```bash
   npm start
   ```
6. Run on Android/iOS:
   - Install Expo Go on your device
   - Scan the QR code with the Expo Go app

## Firestore Security Rules Example

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /movies/{movieId}/reviews/{reviewId} {
      allow read: if true;
      allow write, update, delete: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## Project Structure

```
reMovie/
├── assets/           # Images and other static assets
├── components/       # Reusable UI components
├── constants/        # App constants and configuration
├── context/          # Auth context
├── navigation/       # Navigation configuration
├── screens/          # App screens
├── services/         # API and Firebase services
├── types/            # TypeScript type definitions
├── App.tsx           # Root component
└── package.json      # Project dependencies
```

## Technologies Used

- React Native (Expo)
- TypeScript
- React Navigation
- TMDB API
- Firebase (Firestore, Auth)
- AsyncStorage
- React Native Vector Icons

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
