export type AuthErrorCode =
  | "invalid_credentials"
  | "blocked"
  | "unverified"
  | "too_many_requests"
  | "validation"
  | "network"
  | "unknown";

type LoginResponse = {
  redirectTo?: string;
  accessToken?: string;
};

type RecoveryResponse = {
  message?: string;
};

const DEFAULT_LOGIN_REDIRECT = "/dashboard";

export function validateEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  // Basic RFC 5322-compatible email check for client-side validation.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function getLoginErrorMessage(code: AuthErrorCode): string {
  const messages: Record<AuthErrorCode, string> = {
    invalid_credentials:
      "Неверные учетные данные. Попробуйте еще раз или восстановите доступ.",
    blocked:
      "Аккаунт временно заблокирован. Проверьте почту или обратитесь в поддержку.",
    unverified:
      "Требуется подтверждение аккаунта. Проверьте почту или запросите новое письмо.",
    too_many_requests:
      "Слишком много попыток. Подождите немного и попробуйте снова.",
    validation: "Проверьте корректность введенных данных.",
    network:
      "Нет связи с сервером. Проверьте подключение и попробуйте снова.",
    unknown: "Произошла ошибка. Попробуйте снова через несколько секунд.",
  };

  return messages[code] ?? messages.unknown;
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
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = (await safeJson<LoginResponse>(response)) ?? {};
      return {
        ok: true,
        redirectTo: data.redirectTo || DEFAULT_LOGIN_REDIRECT,
      };
    }

    const code = mapLoginErrorCode(response.status);
    return { ok: false, code, message: getLoginErrorMessage(code) };
  } catch {
    return {
      ok: false,
      code: "network",
      message: getLoginErrorMessage("network"),
    };
  }
}

export async function recoveryRequest(
  email: string,
): Promise<
  | { ok: true; message?: string }
  | { ok: false; code: AuthErrorCode; message: string }
> {
  try {
    const response = await fetch("/api/auth/recover", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    if (response.ok) {
      const data = (await safeJson<RecoveryResponse>(response)) ?? {};
      return { ok: true, message: data.message };
    }

    const code = mapRecoveryErrorCode(response.status);
    return { ok: false, code, message: getLoginErrorMessage(code) };
  } catch {
    return {
      ok: false,
      code: "network",
      message: getLoginErrorMessage("network"),
    };
  }
}

function mapLoginErrorCode(status: number): AuthErrorCode {
  if (status === 401) return "invalid_credentials";
  if (status === 423) return "unverified";
  if (status === 400) return "validation";
  if (status >= 500) return "unknown";
  return "unknown";
}

function mapRecoveryErrorCode(status: number): AuthErrorCode {
  if (status === 400) return "validation";
  if (status === 429) return "too_many_requests";
  if (status >= 500) return "unknown";
  return "unknown";
}

async function safeJson<T>(response: Response): Promise<T | undefined> {
  try {
    return (await response.json()) as T;
  } catch {
    return undefined;
  }
}
