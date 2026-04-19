import { initializeApp } from "firebase/app";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Global utility wrapper to handle firestore error consistently
export interface FirestoreErrorInfo {
  error: string;
  operationType: "create" | "update" | "delete" | "list" | "get" | "write";
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: FirestoreErrorInfo["operationType"],
  path: string | null = null,
) {
  if (error instanceof Error && error.message.includes("Missing or insufficient permissions")) {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user ? user.uid : "",
        email: user && user.email ? user.email : "",
        emailVerified: user ? user.emailVerified : false,
        isAnonymous: user ? user.isAnonymous : true,
        providerInfo: user
          ? user.providerData.map((p) => ({
              providerId: p.providerId,
              displayName: p.displayName || "",
              email: p.email || "",
            }))
          : [],
      },
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}
