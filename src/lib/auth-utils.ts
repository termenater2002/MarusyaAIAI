"use client";

import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { firebaseApp } from "@/lib/firebase";

export type AuthErrorCode =
  | "invalid_credentials"
  | "blocked"
  | "unverified"
  | "too_many_requests"
  | "email_taken"
  | "popup_blocked"
  | "validation"
  | "network"
  | "popup_closed"
  | "unauthorized_domain"
  | "provider_disabled"
  | "unknown";

type RecoveryResponse = {
  message?: string;
  code?: AuthErrorCode;
};

const DEFAULT_LOGIN_REDIRECT = "/";

function getFirebaseAuth() {
  return getAuth(firebaseApp);
}

async function runRegisterPreflight(email: string) {
  try {
    await fetch("/api/auth/register-preflight", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
  } catch {
    // Best-effort cleanup only.
  }
}

async function createBackendSession({
  idToken,
  email,
  displayName,
}: {
  idToken: string;
  email?: string | null;
  displayName?: string | null;
}) {
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      idToken,
      email,
      displayName,
    }),
  });

  if (!response.ok) {
    const data = (await safeJson<{ code?: AuthErrorCode }>(response)) ?? {};
    const code = data.code ?? "unknown";

    return {
      ok: false as const,
      code,
      message: getLoginErrorMessage(code),
    };
  }

  const data = (await safeJson<{ redirectTo?: string }>(response)) ?? {};

  return {
    ok: true as const,
    redirectTo: data.redirectTo || DEFAULT_LOGIN_REDIRECT,
  };
}

async function legacyLoginRequest({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  | { ok: true; redirectTo: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = (await safeJson<{ redirectTo?: string }>(response)) ?? {};
      return {
        ok: true,
        redirectTo: data.redirectTo || DEFAULT_LOGIN_REDIRECT,
      };
    }

    const data = (await safeJson<{ code?: AuthErrorCode }>(response)) ?? {};
    const code = data.code ?? "unknown";
    return { ok: false, code, message: getLoginErrorMessage(code) };
  } catch {
    return {
      ok: false,
      code: "network",
      message: getLoginErrorMessage("network"),
    };
  }
}

export function validateEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function getLoginErrorMessage(code: AuthErrorCode): string {
  const messages: Record<AuthErrorCode, string> = {
    invalid_credentials: "Неверный email или пароль.",
    blocked: "Аккаунт временно недоступен.",
    unverified: "Подтверди почту через письмо, а потом входи в аккаунт.",
    too_many_requests: "Слишком много попыток. Попробуй чуть позже.",
    email_taken:
      "Аккаунт с таким email уже существует. Если почта твоя, восстанови доступ через письмо и задай новый пароль.",
    popup_blocked: "Браузер заблокировал окно входа. Разреши всплывающее окно и попробуй снова.",
    validation: "Проверь корректность введённых данных.",
    network: "Нет связи с сервером. Проверь подключение и попробуй снова.",
    popup_closed: "Окно входа было закрыто до завершения авторизации.",
    unauthorized_domain:
      "Этот домен не разрешён в Firebase Auth. Добавь его в список Authorized domains.",
    provider_disabled:
      "В Firebase не включён вход через Google. Включи Google provider в Authentication.",
    unknown: "Произошла ошибка. Попробуй снова через несколько секунд.",
  };

  return messages[code] ?? messages.unknown;
}

function mapFirebaseErrorCode(error: unknown): AuthErrorCode {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  switch (code) {
    case "auth/email-already-in-use":
      return "email_taken";
    case "auth/invalid-email":
    case "auth/missing-password":
    case "auth/weak-password":
      return "validation";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return "invalid_credentials";
    case "auth/too-many-requests":
      return "too_many_requests";
    case "auth/network-request-failed":
      return "network";
    case "auth/popup-blocked":
      return "popup_blocked";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "popup_closed";
    case "auth/unauthorized-domain":
      return "unauthorized_domain";
    case "auth/operation-not-allowed":
      return "provider_disabled";
    default:
      return "unknown";
  }
}

export async function loginRequest({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<
  | { ok: true; redirectTo: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);

    if (!credential.user.emailVerified) {
      try {
        await signOut(auth);
      } catch {
        // Ignore sign-out failures and still block access.
      }

      return {
        ok: false,
        code: "unverified",
        message: getLoginErrorMessage("unverified"),
      };
    }

    const idToken = await credential.user.getIdToken();

    return await createBackendSession({
      idToken,
      email: credential.user.email,
      displayName: credential.user.displayName,
    });
  } catch (error) {
    const code = mapFirebaseErrorCode(error);

    if (code === "invalid_credentials") {
      return legacyLoginRequest({ email, password });
    }

    return { ok: false, code, message: getLoginErrorMessage(code) };
  }
}

export async function loginWithGoogleRequest(): Promise<
  | { ok: true; redirectTo: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);

    if (!credential.user.emailVerified) {
      try {
        await signOut(auth);
      } catch {
        // Ignore sign-out failures and still block access.
      }

      return {
        ok: false,
        code: "unverified",
        message: getLoginErrorMessage("unverified"),
      };
    }

    const idToken = await credential.user.getIdToken();

    return await createBackendSession({
      idToken,
      email: credential.user.email,
      displayName: credential.user.displayName,
    });
  } catch (error) {
    console.error("Google login failed", error);
    const code = mapFirebaseErrorCode(error);
    return { ok: false, code, message: getLoginErrorMessage(code) };
  }
}

export async function recoveryRequest(
  email: string,
): Promise<
  | { ok: true; message?: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    const auth = getFirebaseAuth();
    await sendPasswordResetEmail(auth, email);

    const data = ({
      message: "Если аккаунт найден, письмо для сброса пароля уже отправлено.",
    } satisfies RecoveryResponse);

    return { ok: true, message: data.message };
  } catch (error) {
    const code = mapFirebaseErrorCode(error);

    if (code === "invalid_credentials") {
      return {
        ok: true,
        message: "Если аккаунт найден, письмо для сброса пароля уже отправлено.",
      };
    }

    return { ok: false, code, message: getLoginErrorMessage(code) };
  }
}

export async function registerRequest({
  email,
  password,
  displayName,
}: {
  email: string;
  password: string;
  username?: string;
  displayName?: string;
}): Promise<
  | { ok: true; redirectTo: string; message?: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    await runRegisterPreflight(email);

    const auth = getFirebaseAuth();
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    if (displayName?.trim()) {
      await updateProfile(credential.user, {
        displayName: displayName.trim(),
      });
    }

    try {
      await sendEmailVerification(credential.user);
    } catch {
      // Registration should still succeed even if the letter is delayed.
    }
    try {
      await signOut(auth);
    } catch {
      // Ignore sign-out failures after signup.
    }

    return {
      ok: true,
      redirectTo: "/login",
      message:
        "Регистрация прошла успешно. Подтверди почту через письмо, а потом войди в аккаунт. Если письмо не пришло, попробуй зарегистрироваться ещё раз через 10 минут.",
    };
  } catch (error) {
    const code = mapFirebaseErrorCode(error);

    if (code === "email_taken") {
      await runRegisterPreflight(email);

      try {
        const auth = getFirebaseAuth();
        const retryCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (displayName?.trim()) {
          await updateProfile(retryCredential.user, {
            displayName: displayName.trim(),
          });
        }

        try {
          await sendEmailVerification(retryCredential.user);
        } catch {
          // Registration should still succeed even if the letter is delayed.
        }

        try {
          await signOut(auth);
        } catch {
          // Ignore sign-out failures after signup.
        }

        return {
          ok: true,
          redirectTo: "/login",
          message:
            "Регистрация прошла успешно. Подтверди почту через письмо, а потом войди в аккаунт. Если письмо не пришло, посмотрите в папке СПАМ или попробуйте зарегистрироваться ещё раз через 10 минут.",
        };
      } catch (retryError) {
        if (mapFirebaseErrorCode(retryError) !== "email_taken") {
          const retryCode = mapFirebaseErrorCode(retryError);
          return { ok: false, code: retryCode, message: getLoginErrorMessage(retryCode) };
        }
      }

      try {
        const auth = getFirebaseAuth();
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();

        const sessionResult = await createBackendSession({
          idToken,
          email: credential.user.email,
          displayName: credential.user.displayName || displayName,
        });

        if (!sessionResult.ok) {
          return sessionResult;
        }

        return {
          ok: true,
          redirectTo: sessionResult.redirectTo,
          message: "Аккаунт уже существовал, поэтому мы просто выполнили вход.",
        };
      } catch (signInError) {
        const signInCode = mapFirebaseErrorCode(signInError);

        if (signInCode === "invalid_credentials") {
          try {
            await sendPasswordResetEmail(getFirebaseAuth(), email);
          } catch {
            // Ignore delivery errors and still return the reclaim guidance.
          }

          return {
            ok: false,
            code: "email_taken",
            message:
              "Этот email уже занят. Если почта твоя, мы отправили письмо для восстановления доступа: задай новый пароль, потом подтверди почту и войди.",
          };
        }

        if (signInCode === "unverified") {
          return {
            ok: false,
            code: "unverified",
            message: getLoginErrorMessage("unverified"),
          };
        }
      }
    }

    return { ok: false, code, message: getLoginErrorMessage(code) };
  }
}

export async function logoutRequest() {
  const auth = getFirebaseAuth();

  try {
    await signOut(auth);
  } catch {
    // Ignore Firebase client sign-out failures and still clear the backend session.
  }

  await fetch("/api/auth/logout", {
    method: "POST",
  });
}

async function safeJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}
