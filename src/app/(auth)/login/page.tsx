import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Войти | AI Каталог",
  description: "Авторизация по email и паролю",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Авторизация
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Вход в аккаунт
        </h1>
        <p className="text-base text-muted-foreground">
          Введите email и пароль, чтобы продолжить. При проблемах используйте восстановление.
        </p>
      </header>

      <LoginForm />
    </div>
  );
}
