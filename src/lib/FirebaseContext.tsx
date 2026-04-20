import React, { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider, testConnection } from "./firebase";
import { toast } from "sonner";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { AuthModal } from "./AuthModal";
import { isAdmin, initializeAdminUsers } from "./locationVotes";

interface FirebaseContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: () => boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => {},
  logout: async () => {},
  requireAuth: () => false,
});

export const useFirebase = () => useContext(FirebaseContext);

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState(false);

  useEffect(() => {
    testConnection(); // Ensure connection works
    initializeAdminUsers(); // Initialize admin users in Firestore

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setAdminStatus(isAdmin(currentUser.email || undefined));
        setAuthModalOpen(false);
        // Provision user profile lazily
        const userRef = doc(db, "users", currentUser.uid);
        const snap = await getDoc(userRef);
        if (!snap.exists()) {
          try {
            await setDoc(userRef, {
              handle:
                "@" +
                (currentUser.email
                  ? currentUser.email.split("@")[0]
                  : currentUser.phoneNumber || "guest"
                )
                  .replace(/[^a-z0-9]/gi, "")
                  .toLowerCase(),
              avatar: currentUser.photoURL || "",
              firePoints: 500, // starting bonus
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
          } catch (e) {
            console.error("Could not bootstrap user profile", e);
          }
        }
      } else {
        setUser(null);
        setAdminStatus(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success("Successfully logged in!");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      toast.error("Failed to sign in", { description: msg });
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out");
    } catch (error: unknown) {
      toast.error("Failed to sign out");
    }
  };

  const requireAuth = () => {
    if (user) return true;
    setAuthModalOpen(true);
    return false;
  };

  return (
    <FirebaseContext.Provider value={{ user, loading, isAdmin: adminStatus, login, logout, requireAuth }}>
      {children}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </FirebaseContext.Provider>
  );
}
