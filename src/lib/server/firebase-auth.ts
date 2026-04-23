type FirebaseLookupUser = {
  localId: string;
  email?: string;
  emailVerified?: boolean;
  displayName?: string;
  disabled?: boolean;
};

const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

export async function lookupFirebaseUser(idToken: string): Promise<FirebaseLookupUser | null> {
  if (!FIREBASE_API_KEY) {
    throw new Error("Missing NEXT_PUBLIC_FIREBASE_API_KEY");
  }

  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    users?: FirebaseLookupUser[];
  };

  return data.users?.[0] ?? null;
}
