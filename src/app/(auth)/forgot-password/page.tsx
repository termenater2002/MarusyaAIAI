import type { Metadata } from "next";

import { RecoveryForm } from "./recovery-form";

export const metadata: Metadata = {
  title: "Восстановление доступа | AI Каталог",
  description: "Восстановление доступа по email",
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Восстановление
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Восстановление доступа
        </h1>
        <p className="text-base text-muted-foreground">
          Укажите email — если аккаунт найден, мы отправим инструкции по восстановлению.
        </p>
      </header>

      <RecoveryForm />
    </div>
  );
}
