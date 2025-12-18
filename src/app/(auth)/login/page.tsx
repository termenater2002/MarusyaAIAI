import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Войти | AI Каталог",
  description: "Авторизация пользователей AI Каталога",
};

export default function LoginPage() {
  return (
    <section className="space-y-6 rounded-xl border border-border/60 bg-card/50 p-6 shadow-sm">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          AI Каталог
        </p>
        <h1 id="login-heading" className="text-2xl font-semibold leading-tight">
          Добро пожаловать обратно
        </h1>
        <p className="text-sm text-muted-foreground">
          Введите email и пароль, чтобы получить доступ к своим избранным и закрытым разделам.
        </p>
      </header>

      <LoginForm />
    </section>
  );
}
