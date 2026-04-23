"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FavoriteToggleButtonProps = {
  toolId: number;
  compact?: boolean;
  className?: string;
};

export function FavoriteToggleButton({
  toolId,
  compact = false,
  className,
}: FavoriteToggleButtonProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(false);
  const [resolved, setResolved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [verificationBlocked, setVerificationBlocked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadState = async () => {
      try {
        const response = await fetch(`/api/favorites/${toolId}`, {
          cache: "no-store",
        });

        if (response.status === 401) {
          if (!cancelled) {
            setFavorited(false);
            setVerificationBlocked(false);
            setResolved(true);
          }
          return;
        }

        if (response.status === 423) {
          if (!cancelled) {
            setFavorited(false);
            setVerificationBlocked(true);
            setResolved(true);
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Не удалось загрузить состояние избранного.");
        }

        const data = (await response.json()) as { favorited: boolean };

        if (!cancelled) {
          setFavorited(data.favorited);
          setVerificationBlocked(false);
          setResolved(true);
        }
      } catch {
        if (!cancelled) {
          setFavorited(false);
          setVerificationBlocked(false);
          setResolved(true);
        }
      }
    };

    void loadState();

    return () => {
      cancelled = true;
    };
  }, [toolId]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const method = favorited ? "DELETE" : "POST";
      const response = await fetch(
        favorited ? `/api/favorites/${toolId}` : "/api/favorites",
        {
          method,
          headers: favorited
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          body: favorited ? undefined : JSON.stringify({ toolId }),
        },
      );

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 423) {
        setVerificationBlocked(true);
        return;
      }

      if (!response.ok) {
        return;
      }

      setVerificationBlocked(false);
      setFavorited((current) => !current);
      router.refresh();
    });
  };

  if (!resolved) {
    return compact ? (
      <div className={cn("size-8 rounded-full border border-border/60 bg-background/80", className)} />
    ) : (
      <Button type="button" variant="outline" className={className} disabled>
        <Heart className="size-4" aria-hidden />
        Избранное
      </Button>
    );
  }

  if (compact) {
    return (
      <Button
        type="button"
        variant={favorited ? "default" : "outline"}
        size="icon-sm"
        className={cn("rounded-full shadow-sm", className)}
        aria-label={favorited ? "Убрать из избранного" : "Добавить в избранное"}
        title={
          verificationBlocked
            ? "Подтвердите почту, чтобы пользоваться избранным"
            : undefined
        }
        onClick={handleClick}
        disabled={isPending}
      >
        <Heart
          className={cn("size-4", favorited ? "fill-current" : "")}
          aria-hidden
        />
      </Button>
    );
  }

  return (
    <Button
      type="button"
      variant={favorited ? "default" : "outline"}
      className={className}
      title={
        verificationBlocked
          ? "Подтвердите почту, чтобы пользоваться избранным"
          : undefined
      }
      onClick={handleClick}
      disabled={isPending}
    >
      <Heart className={cn("size-4", favorited ? "fill-current" : "")} aria-hidden />
      {favorited ? "В избранном" : "В избранное"}
    </Button>
  );
}
