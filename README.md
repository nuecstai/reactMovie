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

## Download

### Ready-to-install APK
You can download the latest production APK from the [GitHub Releases](https://github.com/nuecstai/reactMovie/releases) page.

> **✅ Latest APK includes working TMDB and Firebase integration** - The APK has been tested and confirmed to work with all features including movie browsing, user authentication, and reviews.

**Current Release:**
- **Version**: 1.0.0
- **Date**: June 16, 2025
- **File**: `app-release.apk`
- **Size**: ~71.7 MB
- **Requirements**: Android 5.0+ (API level 21)
- **Architectures**: Universal (arm64-v8a, armeabi-v7a, x86, x86_64)

### Installation
1. Download the APK from releases
2. Enable "Install from Unknown Sources" in Android settings
3. Install the APK

## Prerequisites

### For End Users
- Android device running Android 5.0+ (API level 21)
- ~100 MB free storage space

### For Developers

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- TMDB API key
- Firebase project (for Firestore and Auth)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/nuecstai/reactMovie.git
   cd reactMovie
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` and add your API keys:
   ```
   TMDB_API_KEY=your_actual_api_key_here
   FIREBASE_API_KEY=your_firebase_api_key_here
   # ... other Firebase config values
   ```
4. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com/
   - Enable Authentication (Email/Password recommended)
   - Enable Firestore Database
   - Go to Project Settings > General > Your apps > SDK setup and configuration
   - Copy the Firebase configuration values to your `.env` file
   - Set Firestore rules (see below)

5. Start the development server:
   ```bash
   npm start
   ```
6. Run on Android/iOS:
   - Install Expo Go on your device
   - Scan the QR code with the Expo Go app

## Production Build

### Android APK

A production-ready APK is available in the `android/app/build/outputs/apk/release/` directory.

**Pre-built APK**: `app-release.apk` (~71.7 MB)

To build your own production APK:

1. **Set up environment variables**: Ensure your `.env` file contains all required API keys

2. **Configure for production**: Inject environment variables into the app configuration:
   ```bash
   node scripts/configure-env.js
   ```

3. **Generate a signing keystore** (one-time setup):
   ```bash
   cd android/app
   keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
   ```

4. **Build the production APK**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **Reset configuration** (optional, keeps source code clean):
   ```bash
   git checkout app.json
   ```

6. The APK will be generated at: `android/app/build/outputs/apk/release/app-release.apk`

> **🔒 Security Note**: The production APK contains real API keys (required for functionality), while the source code uses placeholder values for security. This is the correct and secure approach for mobile app distribution.

### Installation

- Enable "Install from Unknown Sources" in your Android device settings
- Transfer the APK file to your device
- Install the APK by tapping on it

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

## Environment Variables

This app requires several environment variables to function properly. A template file `.env.example` is provided.

### Required Variables
- `TMDB_API_KEY`: Get from [TMDB API](https://www.themoviedb.org/settings/api)
- `FIREBASE_API_KEY`: From Firebase project settings
- `FIREBASE_AUTH_DOMAIN`: Your Firebase auth domain
- `FIREBASE_PROJECT_ID`: Your Firebase project ID
- `FIREBASE_STORAGE_BUCKET`: Your Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID`: Firebase messaging sender ID
- `FIREBASE_APP_ID`: Your Firebase app ID

### Security Note
⚠️ **Never commit your `.env` file to version control.** It contains sensitive API keys and should be kept private.

## Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Detailed deployment and build instructions
- [SECURITY.md](SECURITY.md) - Security best practices and setup guide

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Set up your own `.env` file with your API keys
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
