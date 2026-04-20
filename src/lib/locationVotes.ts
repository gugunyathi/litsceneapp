import { doc, setDoc, getDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_EMAILS = [
  "2satoshy@gmail.com",
  "gugunewman@gmail.com",
  "gugu@ribbonprotocol.org",
  "hello@ribbonprotocol.org",
  "gugunyathi@gmail.com",
];

export function isAdmin(email?: string): boolean {
  return email ? ADMIN_EMAILS.includes(email) : false;
}

export async function recordLocationVote(
  userId: string,
  postId: string,
  vote: "yes" | "no"
): Promise<void> {
  try {
    const voteRef = doc(db, "locationVotes", `${postId}_${userId}`);
    await setDoc(voteRef, {
      postId,
      userId,
      vote,
      timestamp: new Date(),
    });

    // Increment location vote count
    const locationRef = doc(db, "locationVerification", postId);
    const voteCount = vote === "yes" ? 1 : -1;
    await setDoc(
      locationRef,
      {
        yesVotes: increment(vote === "yes" ? 1 : 0),
        noVotes: increment(vote === "no" ? 1 : 0),
        lastUpdated: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Error recording location vote", error);
  }
}

export async function getUserVoteForLocation(
  userId: string,
  postId: string
): Promise<"yes" | "no" | null> {
  try {
    const voteRef = doc(db, "locationVotes", `${postId}_${userId}`);
    const snap = await getDoc(voteRef);
    return snap.exists() ? (snap.data().vote as "yes" | "no") : null;
  } catch (error) {
    console.error("Error getting user vote", error);
    return null;
  }
}

export async function getLocationVerificationStats(postId: string) {
  try {
    const veriRef = doc(db, "locationVerification", postId);
    const snap = await getDoc(veriRef);
    if (snap.exists()) {
      return snap.data();
    }
    return { yesVotes: 0, noVotes: 0 };
  } catch (error) {
    console.error("Error getting verification stats", error);
    return { yesVotes: 0, noVotes: 0 };
  }
}

// Initialize admin users in Firestore
export async function initializeAdminUsers(): Promise<void> {
  try {
    for (const email of ADMIN_EMAILS) {
      const adminRef = doc(db, "admins", email);
      const snap = await getDoc(adminRef);
      if (!snap.exists()) {
        await setDoc(adminRef, {
          email,
          role: "admin",
          createdAt: new Date(),
          permissions: ["editLocations", "verifyLocations", "removeSpam"],
        });
      }
    }
  } catch (error) {
    console.error("Error initializing admin users", error);
  }
}
