import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  Timestamp,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// ── Firebase Configuration ──
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

const REQUIRED_FIREBASE_ENV = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

function isPlaceholder(value) {
  if (!value) return true;
  const normalized = String(value).trim();
  return (
    normalized.startsWith("your_") ||
    normalized === "000000000000" ||
    normalized === "1:000:web:000"
  );
}

const missingFirebaseEnvKeys = REQUIRED_FIREBASE_ENV.filter((key) =>
  isPlaceholder(import.meta.env[key])
);

const isFirebaseConfigured = missingFirebaseEnvKeys.length === 0;

function createFirebaseConfigError() {
  const error = new Error(
    `Missing Firebase env vars: ${missingFirebaseEnvKeys.join(", ")}`
  );
  error.code = "auth/configuration-not-found";
  return error;
}

// ── Initialize Firebase ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ── Auth Helpers ──
export async function signInWithGoogle() {
  if (!isFirebaseConfigured) {
    throw createFirebaseConfigError();
  }

  googleProvider.setCustomParameters({ prompt: "select_account" });

  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    if (
      error?.code === "auth/popup-blocked" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw error;
  }
}

export function getAuthErrorMessage(error) {
  const code = error?.code;
  switch (code) {
    case "auth/popup-closed-by-user":
      return null;
    case "auth/configuration-not-found":
      return "Firebase config missing. Add VITE_FIREBASE_* values in .env.local and restart dev server.";
    case "auth/unauthorized-domain":
      return "This domain is not authorized in Firebase. Add it in Authentication > Settings > Authorized domains.";
    case "auth/operation-not-allowed":
      return "Google sign-in is disabled. Enable Google provider in Firebase Authentication.";
    case "auth/invalid-api-key":
      return "Invalid Firebase API key. Verify VITE_FIREBASE_API_KEY.";
    case "auth/network-request-failed":
      return "Network request failed. Check internet/VPN/ad-blocker and retry.";
    default:
      return `Authentication failed (${code || "unknown_error"}). Check Firebase setup and browser console.`;
  }
}

export function getFirebaseConfigStatus() {
  return {
    isConfigured: isFirebaseConfigured,
    missingKeys: missingFirebaseEnvKeys,
  };
}

export const logOut = () => signOut(auth);
export const onAuthChange = (callback) => onAuthStateChanged(auth, callback);

// ── Temporary Vault (TTL: 24h) ──
// All scan data is tagged with an expiry timestamp for auto-deletion
const VAULT_COLLECTION = "temporary_vault";
const TTL_HOURS = 24;

/**
 * Store scan metadata in the Temporary Vault with a 24-hour TTL tag.
 * Firestore TTL policies will auto-delete documents past their expiry.
 */
export async function storeScanResult(userId, scanData) {
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(
    new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  );

  const docRef = await addDoc(collection(db, VAULT_COLLECTION), {
    userId,
    ...scanData,
    createdAt: now,
    expiresAt, // TTL field — Firestore TTL policy deletes when this passes
    status: "completed",
  });

  return docRef.id;
}

/**
 * Retrieve all scan results for a user (only non-expired ones).
 */
export async function getUserScans(userId) {
  const q = query(
    collection(db, VAULT_COLLECTION),
    where("userId", "==", userId),
    where("expiresAt", ">", Timestamp.now()),
    orderBy("expiresAt"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

/**
 * Manually delete a scan result (user-initiated).
 */
export async function deleteScanResult(scanId) {
  await deleteDoc(doc(db, VAULT_COLLECTION, scanId));
}

/**
 * Upload media to Firebase Storage with a path that includes the user ID.
 * Returns the download URL for Gemini processing.
 */
export async function uploadMedia(userId, file) {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
  const storageRef = ref(
    storage,
    `vault/${userId}/${timestamp}_${sanitizedName}`
  );

  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);

  return {
    url: downloadURL,
    path: snapshot.ref.fullPath,
    contentType: file.type,
    size: file.size,
  };
}

/**
 * Delete media from Firebase Storage.
 */
export async function deleteMedia(filePath) {
  const storageRef = ref(storage, filePath);
  await deleteObject(storageRef);
}

export { auth, db, storage };
