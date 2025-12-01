import admin from "firebase-admin";
import fs from "fs";
import path from "path";

let firebaseInitialized = false;

/**
 * Initialize Firebase Admin SDK
 * Uses service account file if available, or environment variables
 */
function initializeFirebase(): void {
  if (firebaseInitialized || admin.apps.length > 0) {
    return;
  }

  // Try to use service account file first
  const serviceAccountPath = path.join(
    __dirname,
    "mayclub-691bb-firebase-adminsdk-fbsvc-c6e9fe6d70.json"
  );

  if (fs.existsSync(serviceAccountPath)) {
    try {
      const serviceAccount = JSON.parse(
        fs.readFileSync(serviceAccountPath, "utf-8")
      );
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      firebaseInitialized = true;
      console.log("Firebase initialized with service account file");
      return;
    } catch (error) {
      console.warn("Failed to initialize Firebase with service account file:", error);
    }
  }

  // Try to use environment variables
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
      });
      firebaseInitialized = true;
      console.log("Firebase initialized with environment variables");
      return;
    } catch (error) {
      console.warn("Failed to initialize Firebase with environment variables:", error);
    }
  }

  // If neither method works, log a warning but don't crash
  console.warn(
    "Firebase not initialized: Service account file not found and environment variables not set. Firebase features will be unavailable."
  );
}

// Initialize Firebase lazily (only when needed)
// This prevents the app from crashing if Firebase is not configured
initializeFirebase();

export default admin;
