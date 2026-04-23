"use client";

import { FormEvent, useState } from "react";

import { AIToolCard } from "@/app/components/ai-tool-card";
import type { ApiToolDetail } from "@/app/lib/ai-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

type BasicSearchResponse = {
  query: string;
  results: ApiToolDetail[];
};

export function BasicSearchClient() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<BasicSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (nextQuery: string) => {
    const normalized = nextQuery.trim();

    if (!normalized) {
      setError("Введи запрос для поиска.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search/basic?query=${encodeURIComponent(normalized)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Не удалось выполнить поиск.");
      }

      const result = (await response.json()) as BasicSearchResponse;
      setData(result);
    } catch {
      setError("Не удалось выполнить поиск. Попробуй ещё раз.");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSearch(query);
  };

  return (
    <div className="site-container flex flex-col gap-8 py-8">
      <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Поиск
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Найдём инструменты по ключевым словам
          </h1>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: удаление фона"
            className="h-11"
          />
          <Button type="submit" className="h-11 gap-2 px-5" disabled={isLoading}>
            <Search className="size-4" aria-hidden />
            {isLoading ? "Ищем..." : "Искать"}
          </Button>
        </form>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data ? (
        <section className="space-y-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm text-sm text-muted-foreground">
            Запрос: <span className="font-medium text-foreground">{data.query}</span>
            {" · "}
            Найдено:{" "}
            <span className="font-medium text-foreground">{data.results.length}</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.results.map((result) => (
              <AIToolCard key={result.id} tool={result} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
