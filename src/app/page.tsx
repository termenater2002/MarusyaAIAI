import { AIToolGrid } from "@/app/components/ai-tool-grid";

export default function Home() {
  return (
    <div className="site-container flex flex-col gap-8 py-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          AI Каталог
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Каталог реальных AI-инструментов из исходных данных.
        </h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          Показываем название, краткое описание, рейтинг и теги каждого сервиса напрямую из aiData без выдуманных элементов.
        </p>
      </header>

      <AIToolGrid />
    </div>
  );
}
