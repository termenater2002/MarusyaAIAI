"use client";

import { FormEvent, useState } from "react";

import { AIToolCard } from "@/app/components/ai-tool-card";
import type { ApiToolDetail } from "@/app/lib/ai-utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

type SearchResult = {
  item: ApiToolDetail;
  score: number;
  reason: string;
};

type SearchResponse = {
  query: string;
  parsedQuery: {
    normalizedQuery: string;
    keywords: string[];
    filters: {
      isFree: boolean | null;
      requiresRegistration: boolean | null;
      worksInRussia: boolean | null;
      needsVPN: boolean | null;
    };
  };
  results: SearchResult[];
};

export function SmartSearchClient() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = async (nextQuery: string) => {
    const normalized = nextQuery.trim();

    if (!normalized) {
      setError("Введи запрос для подбора.");
      setData(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search/tools?query=${encodeURIComponent(normalized)}`,
        {
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error("Не удалось выполнить поиск.");
      }

      const result = (await response.json()) as SearchResponse;
      setData(result);
    } catch {
      setError("Не удалось подобрать инструменты. Попробуй ещё раз.");
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
            Умный подбор
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            Найдём подходящие инструменты по обычному запросу
          </h1>
        </div>

        <form className="flex flex-col gap-3 sm:flex-row" onSubmit={handleSubmit}>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Например: бесплатная нейросеть для удаления фона"
            className="h-11"
          />
          <Button type="submit" className="h-11 gap-2 px-5" disabled={isLoading}>
            <Sparkles className="size-4" aria-hidden />
            {isLoading ? "Ищем..." : "Подобрать"}
          </Button>
        </form>
      </section>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {data ? (
        <section className="space-y-6">
          <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-sm text-muted-foreground">
              Запрос: <span className="font-medium text-foreground">{data.query}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Найдено результатов:{" "}
              <span className="font-medium text-foreground">{data.results.length}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Нормализовано:{" "}
              <span className="font-medium text-foreground">
                {data.parsedQuery.normalizedQuery}
              </span>
            </p>
            <div className="flex flex-wrap gap-2">
              {data.parsedQuery.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {data.results.map((result) => (
              <AIToolCard key={result.item.id} tool={result.item} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
