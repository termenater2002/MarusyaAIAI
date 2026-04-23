import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

import { getPool } from "@/lib/server/db";

const FIREBASE_ADMIN_PROJECT_ID = process.env.FIREBASE_ADMIN_PROJECT_ID;
const FIREBASE_ADMIN_CLIENT_EMAIL = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const FIREBASE_ADMIN_PRIVATE_KEY = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
const FIREBASE_UNVERIFIED_TTL_MINUTES = Number(process.env.FIREBASE_UNVERIFIED_TTL_MINUTES || 10);

function getFirebaseAdminApp() {
  if (!FIREBASE_ADMIN_PROJECT_ID || !FIREBASE_ADMIN_CLIENT_EMAIL || !FIREBASE_ADMIN_PRIVATE_KEY) {
    throw new Error("Missing Firebase Admin environment variables");
  }

  return getApps()[0]
    ?? initializeApp({
      credential: cert({
        projectId: FIREBASE_ADMIN_PROJECT_ID,
        clientEmail: FIREBASE_ADMIN_CLIENT_EMAIL,
        privateKey: FIREBASE_ADMIN_PRIVATE_KEY,
      }),
    });
}

export function getFirebaseAdminAuth() {
  return getAuth(getFirebaseAdminApp());
}

function getUnverifiedTtlMs() {
  return Math.max(1, FIREBASE_UNVERIFIED_TTL_MINUTES) * 60 * 1000;
}

export async function purgeExpiredUnverifiedFirebaseUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const auth = getFirebaseAdminAuth();

  try {
    const user = await auth.getUserByEmail(normalizedEmail);

    if (user.emailVerified) {
      return { purged: false, reason: "verified" as const };
    }

    const creationTimeMs = Date.parse(user.metadata.creationTime || "");
    if (!Number.isFinite(creationTimeMs)) {
      return { purged: false, reason: "unknown_age" as const };
    }

    const isExpired = Date.now() - creationTimeMs >= getUnverifiedTtlMs();
    if (!isExpired) {
      return { purged: false, reason: "too_fresh" as const };
    }

    await auth.deleteUser(user.uid);

    const pool = getPool();
    await pool.query("DELETE FROM users WHERE email = $1", [normalizedEmail]);

    return { purged: true, reason: "expired_unverified" as const };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

    if (code === "auth/user-not-found") {
      return { purged: false, reason: "not_found" as const };
    }

    throw error;
  }
}
