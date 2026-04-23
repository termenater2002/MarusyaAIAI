import type { Metadata } from "next";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Регистрация | AI Каталог",
  description: "Создание аккаунта",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Регистрация
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Создать аккаунт
        </h1>
      </header>

      <RegisterForm />
    </div>
  );
}
