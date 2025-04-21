# reMovie - Movie Review App

A React Native mobile application for browsing and reviewing movies, built with Expo and using the TMDB API.

## Features

- Browse popular and top-rated movies
- Search for movies
- User authentication
- Favorites and watchlist functionality
- Dark theme UI

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Expo CLI
- TMDB API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/reMovie.git
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

4. Start the development server:
```bash
npm start
```

5. Run on Android:
- Install Expo Go on your Android device
- Scan the QR code with the Expo Go app

## Project Structure

```
reMovie/
├── assets/           # Images and other static assets
├── components/       # Reusable UI components
├── constants/        # App constants and configuration
├── navigation/       # Navigation configuration
├── screens/          # App screens
├── services/         # API services
├── types/            # TypeScript type definitions
├── App.tsx           # Root component
└── package.json      # Project dependencies
```

## Technologies Used

- React Native
- Expo
- TypeScript
- React Navigation
- TMDB API
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
