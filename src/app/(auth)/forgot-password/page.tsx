import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Восстановление доступа | AI Каталог",
  description: "Восстановление пароля для пользователей AI Каталога",
};

export default function ForgotPasswordPage() {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Восстановление доступа в разработке</h1>
      <p className="text-sm text-muted-foreground">
        Мы отправим инструкцию по восстановлению на ваш email, как только модуль будет готов.
        Если требуется помощь прямо сейчас, напишите в поддержку по адресу
        {" "}
        <Link
          href="mailto:contact@ai-catalog.local?subject=Восстановление%20доступа"
          className="text-primary underline-offset-4 transition hover:underline"
        >
          contact@ai-catalog.local
        </Link>
        .
      </p>
    </section>
  );
}
