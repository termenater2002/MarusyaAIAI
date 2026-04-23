"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AIToolGrid } from "@/app/components/ai-tool-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type ApiToolListItem } from "@/app/lib/ai-utils";

type FavoriteItem = Pick<
  ApiToolListItem,
  | "id"
  | "name"
  | "entityType"
  | "url"
  | "imageUrl"
  | "description"
  | "editorialRating"
  | "worksInRussia"
  | "needsVPN"
  | "requiresRegistration"
  | "isFree"
  | "tags"
> & {
  favoritedAt: string;
};

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadFavorites = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/favorites", {
          cache: "no-store",
        });

        if (response.status === 401) {
          throw new Error("Чтобы открыть избранное, сначала войди в аккаунт.");
        }

        if (!response.ok) {
          throw new Error("Не удалось загрузить избранное.");
        }

        const data = (await response.json()) as { items: FavoriteItem[] };

        if (!cancelled) {
          setItems(data.items);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error ? loadError.message : "Не удалось загрузить избранное.",
          );
          setItems([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadFavorites();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="site-container space-y-8 py-10">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Избранное
        </p>
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Сохранённые инструменты
        </h1>
      </header>

      {loading ? (
        <div className="rounded-lg border border-border/60 bg-card p-6 text-sm text-muted-foreground">
          Загружаем избранное...
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-6 text-sm text-destructive">
          {error}
        </div>
      ) : items.length === 0 ? (
        <Card className="border border-border/60">
          <CardHeader>
            <CardTitle>Пока пусто</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>У тебя ещё нет сохранённых AI-инструментов.</p>
            <Button asChild variant="outline">
              <Link href="/">Вернуться в каталог</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <AIToolGrid tools={items} />
      )}
    </div>
  );
}
