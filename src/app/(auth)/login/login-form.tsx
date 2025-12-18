"use client";

import { useCallback, useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type Status = "idle" | "validating" | "submitting" | "success" | "error";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialFormState = {
  email: "",
  password: "",
};

type FormErrors = Partial<Record<keyof typeof initialFormState, string>>;

export function LoginForm() {
  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const router = useRouter();

  const emailFieldId = useId();
  const passwordFieldId = useId();
  const alertId = useId();

  const isSubmitting = status === "submitting";

  const validate = useCallback(() => {
    const nextErrors: FormErrors = {};

    const trimmedEmail = form.email.trim();
    if (!trimmedEmail) {
      nextErrors.email = "Укажите email";
    } else if (!emailPattern.test(trimmedEmail)) {
      nextErrors.email = "Введите корректный email";
    }

    if (!form.password) {
      nextErrors.password = "Введите пароль";
    } else if (form.password.length < 8) {
      nextErrors.password = "Пароль должен содержать не менее 8 символов";
    }

    setErrors(nextErrors);

    return nextErrors;
  }, [form.email, form.password]);

  const handleChange = useCallback(
    (field: keyof typeof initialFormState) =>
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setMessage("");
        setStatus((prev) => (prev === "error" ? "idle" : prev));
      },
    []
  );

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      setStatus("validating");
      const nextErrors = validate();

      if (Object.keys(nextErrors).length > 0) {
        setStatus("error");
        setMessage("Проверьте подсказки под полями");
        return;
      }

      try {
        setStatus("submitting");
        setMessage("");

        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: form.email.trim(),
            password: form.password,
          }),
        });

        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          setStatus("success");
          setForm(initialFormState);
          setMessage("Успешный вход. Перенаправляем...");
          router.push(typeof data.redirectTo === "string" ? data.redirectTo : "/dashboard");
          return;
        }

        const errorBody = await response.json().catch(() => ({}));
        const fallbackMessage =
          response.status === 401
            ? "Неверные учетные данные"
            : response.status === 423
            ? "Аккаунт требует дополнительной проверки"
            : "Не удалось выполнить вход. Попробуйте ещё раз";

        setStatus("error");
        setMessage(
          typeof errorBody?.message === "string" && errorBody.message.length > 0
            ? errorBody.message
            : fallbackMessage
        );
        setForm((prev) => ({ ...prev, password: "" }));
      } catch (error) {
        console.error("auth:login", error);
        setStatus("error");
        setMessage("Произошла неожиданная ошибка. Повторите попытку позже");
      }
    },
    [form.email, form.password, router, validate]
  );

  const emailDescribedBy = useMemo(() => (errors.email ? `${emailFieldId}-error` : undefined), [
    emailFieldId,
    errors.email,
  ]);
  const passwordDescribedBy = useMemo(
    () => (errors.password ? `${passwordFieldId}-error` : undefined),
    [errors.password, passwordFieldId]
  );

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="login-heading"
      aria-busy={isSubmitting}
    >
      <div className="space-y-2">
        <label htmlFor={emailFieldId} className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id={emailFieldId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={form.email}
          onChange={handleChange("email")}
          onBlur={validate}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={emailDescribedBy}
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {errors.email ? (
          <p id={`${emailFieldId}-error`} role="alert" className="text-xs text-destructive">
            {errors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label htmlFor={passwordFieldId} className="block text-sm font-medium text-foreground">
          Пароль
        </label>
        <input
          id={passwordFieldId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={handleChange("password")}
          onBlur={validate}
          aria-invalid={Boolean(errors.password)}
          aria-describedby={passwordDescribedBy}
          className="block w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        {errors.password ? (
          <p id={`${passwordFieldId}-error`} role="alert" className="text-xs text-destructive">
            {errors.password}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Минимум 8 символов</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Выполняем вход...
          </span>
        ) : (
          "Войти"
        )}
      </Button>

      <div className="flex flex-col gap-2 text-sm">
        <Link
          href="/register"
          className="text-primary transition hover:text-primary/80"
          aria-label="Перейти к странице регистрации"
        >
          Создать аккаунт
        </Link>
        <Link
          href="/forgot-password"
          className="text-primary transition hover:text-primary/80"
          aria-label="Перейти к восстановлению пароля"
        >
          Забыли пароль?
        </Link>
      </div>

      <div
        id={alertId}
        role="status"
        aria-live="polite"
        className="min-h-[1.5rem] text-sm text-muted-foreground"
      >
        {message}
      </div>
    </form>
  );
}
