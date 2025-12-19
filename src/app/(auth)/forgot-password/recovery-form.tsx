"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getLoginErrorMessage,
  recoveryRequest,
  validateEmail,
} from "@/lib/auth-utils";
import { Loader2 } from "lucide-react";

export function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | undefined>(undefined);

  const isSubmitting = status === "submitting";
  const isSuccess = status === "success";
  const showError = status === "error" && message;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setStatus("error");
      setMessage(getLoginErrorMessage("validation"));
      return;
    }

    setStatus("submitting");
    setMessage(undefined);

    const result = await recoveryRequest(trimmedEmail);

    if (result.ok) {
      setStatus("success");
      setMessage(
        result.message ??
          "Если аккаунт найден, мы отправили инструкции по восстановлению на указанный email.",
      );
      return;
    }

    setStatus("error");
    setMessage(result.message);
  };

  return (
    <Card className="border border-border/60 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle>Отправить письмо</CardTitle>
        <CardDescription>
          Мы пришлем инструкции на указанный email, если аккаунт существует.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="recovery-email">Email</Label>
            <Input
              id="recovery-email"
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
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Отправляем...
                </span>
              ) : (
                "Отправить инструкции"
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

            {isSuccess ? (
              <p
                className="text-sm text-emerald-600 dark:text-emerald-400"
                role="status"
                aria-live="polite"
              >
                {message}
              </p>
            ) : null}
          </div>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/login"
          className="text-primary underline-offset-4 transition hover:text-primary/80 hover:underline"
        >
          Вернуться к входу
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
