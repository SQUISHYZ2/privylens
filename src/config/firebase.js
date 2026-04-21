import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
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
// Replace these with your actual Firebase project credentials
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "demo-project",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "demo.appspot.com",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:000:web:000",
};

// ── Initialize Firebase ──
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

// ── Auth Helpers ──
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
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
