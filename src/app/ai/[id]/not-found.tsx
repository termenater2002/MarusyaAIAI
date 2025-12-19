import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="site-container flex flex-col gap-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        AI инструмент
      </p>
      <h1 className="text-3xl font-semibold">Инструмент не найден</h1>
      <p className="max-w-2xl text-muted-foreground">
        Не удалось найти AI-инструмент по указанному идентификатору. Вернитесь в каталог, чтобы выбрать другой.
      </p>
      <Button asChild>
        <Link href="/">Вернуться в каталог</Link>
      </Button>
    </div>
  );
}
