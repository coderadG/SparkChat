const admin = require('firebase-admin');

// Logic to load credentials:
// 1. If on Render, use the Environment Variable string.
// 2. If on Localhost, use the file (serviceAccountKey.json).
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Parse the JSON string stored in Render's environment variables
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
  // Fallback: Load from local file for development
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL
});

const db = admin.database();

module.exports = { admin, db };