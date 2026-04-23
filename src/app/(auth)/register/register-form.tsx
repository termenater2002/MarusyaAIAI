"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  loginWithGoogleRequest,
  registerRequest,
  validateEmail,
} from "@/lib/auth-utils";
import { Chrome, Loader2 } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | undefined>(undefined);

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success" && message;
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    const trimmedDisplayName = displayName.trim();

    if (!validateEmail(trimmedEmail) || password.trim().length < 6) {
      setStatus("error");
      setMessage("Укажи корректный email и пароль не короче 6 символов.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Пароли не совпадают.");
      return;
    }

    setStatus("submitting");
    setMessage(undefined);

    const result = await registerRequest({
      email: trimmedEmail,
      password,
      displayName: trimmedDisplayName || undefined,
    });

    if (result.ok) {
      setStatus("success");
      setMessage(result.message);
      setPassword("");
      setConfirmPassword("");
      return;
    }

    setStatus("error");
    setMessage(result.message);
  };

  const handleGoogleRegister = async () => {
    setStatus("submitting");
    setMessage(undefined);

    const result = await loginWithGoogleRequest();

    if (result.ok) {
      router.push(result.redirectTo || "/");
      return;
    }

    setStatus("error");
    setMessage(result.message);
  };

  return (
    <Card className="border border-border/60 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle>Регистрация</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleGoogleRegister}
          >
            <Chrome className="size-4" aria-hidden />
            Продолжить через Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
              <span className="bg-card px-2">или</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="display-name">Имя</Label>
            <Input
              id="display-name"
              type="text"
              name="displayName"
              placeholder="Как к тебе обращаться"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-email">Email</Label>
            <Input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-password">Пароль</Label>
            <Input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Не менее 6 символов"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="register-confirm-password">Повторите пароль</Label>
            <Input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Создаём аккаунт...
                </span>
              ) : (
                "Создать аккаунт"
              )}
            </Button>

            {message ? (
              <p
                className={isSuccess ? "text-sm text-emerald-600" : "text-sm text-destructive"}
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            ) : null}
          </div>
          </form>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/login"
          className="text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
        >
          Уже есть аккаунт?
        </Link>
        <Link
          href="/forgot-password"
          className="text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
        >
          Забыли пароль?
        </Link>
      </CardFooter>
    </Card>
  );
}
