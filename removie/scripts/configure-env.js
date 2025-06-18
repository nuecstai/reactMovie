const fs = require('fs');
const path = require('path');
require('dotenv').config();

const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = require(appJsonPath);

// Update the extra section with actual environment variables
appJson.expo.extra = {
  tmdbApiKey: process.env.TMDB_API_KEY || '',
  firebaseApiKey: process.env.FIREBASE_API_KEY || '',
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: process.env.FIREBASE_APP_ID || ''
};

// Write the updated app.json
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

console.log('✅ app.json updated with environment variables');
console.log('Environment variables loaded:');
console.log('- TMDB_API_KEY:', process.env.TMDB_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- FIREBASE_API_KEY:', process.env.FIREBASE_API_KEY ? '✅ Set' : '❌ Missing');
console.log('- FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing');
