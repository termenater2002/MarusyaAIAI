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
  getLoginErrorMessage,
  loginRequest,
  loginWithGoogleRequest,
  validateEmail,
} from "@/lib/auth-utils";
import { Chrome, Loader2 } from "lucide-react";

type FormStatus = "idle" | "submitting" | "success" | "error";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [message, setMessage] = useState<string | undefined>(undefined);

  const isSubmitting = status === "submitting";
  const showError = status === "error" && message;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail) || password.trim().length === 0) {
      setStatus("error");
      setMessage(getLoginErrorMessage("validation"));
      return;
    }

    setStatus("submitting");
    setMessage(undefined);

    const result = await loginRequest({
      email: trimmedEmail,
      password,
    });

    if (result.ok) {
      setStatus("success");
      router.push(result.redirectTo);
      return;
    }

    setStatus("error");
    setMessage(result.message);
    setPassword("");
  };

  const handleGoogleLogin = async () => {
    setStatus("submitting");
    setMessage(undefined);

    const result = await loginWithGoogleRequest();

    if (result.ok) {
      setStatus("success");
      router.push(result.redirectTo);
      return;
    }

    setStatus("error");
    setMessage(result.message);
  };

  return (
    <Card className="border border-border/60 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle>Войти</CardTitle>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
          >
            <Chrome className="size-4" aria-hidden />
            Войти через Google
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
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
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
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Пароль"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
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
                  Входим...
                </span>
              ) : (
                "Войти"
              )}
            </Button>

            {showError ? (
              <p
                className="text-sm text-destructive"
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
          href="/forgot-password"
          className="text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
        >
          Забыли пароль?
        </Link>
        <Link
          href="/register"
          className="text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
        >
          Создать аккаунт
        </Link>
      </CardFooter>
    </Card>
  );
}
