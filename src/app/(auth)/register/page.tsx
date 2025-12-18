import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Регистрация | AI Каталог",
  description: "Создание нового аккаунта AI Каталога",
};

export default function RegisterPage() {
  return (
    <section className="space-y-4 rounded-xl border border-border/60 bg-card/50 p-6 shadow-sm">
      <h1 className="text-2xl font-semibold">Регистрация скоро появится</h1>
      <p className="text-sm text-muted-foreground">
        Мы готовим полноценную форму регистрации. А пока напишите нам на
        {" "}
        <Link
          href="mailto:contact@ai-catalog.local?subject=Регистрация%20AI%20Каталог"
          className="text-primary underline-offset-4 transition hover:underline"
        >
          contact@ai-catalog.local
        </Link>
        , и мы поможем подключить доступ вручную.
      </p>
    </section>
  );
}
