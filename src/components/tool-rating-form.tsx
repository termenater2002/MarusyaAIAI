"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { formatRating } from "@/app/lib/ai-utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ToolRatingFormProps = {
  toolId: number;
  initialAverageRating: number | null;
  initialTotalRatings: number;
};

type RatingResponse = {
  summary: {
    averageRating: number | null;
    totalRatings: number;
  };
  currentUserRating: {
    rating: number;
    reviewText?: string | null;
  } | null;
};

type AccessState = "unknown" | "guest" | "verified_required" | "ready";

export function ToolRatingForm({
  toolId,
  initialAverageRating,
  initialTotalRatings,
}: ToolRatingFormProps) {
  const router = useRouter();
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [currentUserRating, setCurrentUserRating] = useState<number | null>(null);
  const [averageRating, setAverageRating] = useState<number | null>(initialAverageRating);
  const [totalRatings, setTotalRatings] = useState(initialTotalRatings);
  const [accessState, setAccessState] = useState<AccessState>("unknown");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;

    const loadRatings = async () => {
      try {
        const response = await fetch(`/api/ratings/${toolId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Не удалось загрузить оценки.");
        }

        const data = (await response.json()) as RatingResponse;
        const nextUserRating = data.currentUserRating?.rating ?? null;

        if (!cancelled) {
          setAverageRating(data.summary.averageRating);
          setTotalRatings(data.summary.totalRatings);
          setCurrentUserRating(nextUserRating);
          setSelectedRating(nextUserRating);
        }
      } catch {
        if (!cancelled) {
          setAverageRating(initialAverageRating);
          setTotalRatings(initialTotalRatings);
          setCurrentUserRating(null);
          setSelectedRating(null);
        }
      }
    };

    const loadAccess = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (response.status === 401) {
          if (!cancelled) {
            setAccessState("guest");
          }
          return;
        }

        if (!response.ok) {
          throw new Error("Не удалось определить пользователя.");
        }

        const data = (await response.json()) as {
          user?: {
            emailVerified?: boolean;
            email_verified?: boolean;
          } | null;
        };

        if (!cancelled) {
          const isVerified = Boolean(
            data.user?.emailVerified ?? data.user?.email_verified,
          );
          setAccessState(isVerified ? "ready" : "verified_required");
        }
      } catch {
        if (!cancelled) {
          setAccessState("guest");
        }
      }
    };

    void Promise.all([loadRatings(), loadAccess()]);

    return () => {
      cancelled = true;
    };
  }, [initialAverageRating, initialTotalRatings, toolId]);

  const submitRating = () => {
    if (!selectedRating) {
      setMessage("Сначала выбери оценку.");
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const response = await fetch(`/api/ratings/${toolId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rating: selectedRating }),
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 423) {
        setAccessState("verified_required");
        setMessage("Подтверди почту, чтобы ставить оценки.");
        return;
      }

      if (!response.ok) {
        setMessage("Не удалось сохранить оценку. Попробуй ещё раз.");
        return;
      }

      const nextTotalRatings =
        currentUserRating === null ? totalRatings + 1 : totalRatings;
      const nextAverageRating =
        averageRating === null
          ? selectedRating
          : currentUserRating === null
            ? Number(
                (
                  (averageRating * totalRatings + selectedRating) / nextTotalRatings
                ).toFixed(2),
              )
          : Number(
              (
                (averageRating * totalRatings - currentUserRating + selectedRating)
                / nextTotalRatings
              ).toFixed(2),
            );

      setCurrentUserRating(selectedRating);
      setAverageRating(nextAverageRating);
      setTotalRatings(nextTotalRatings);
      setMessage("Оценка сохранена.");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Средняя пользовательская оценка:{" "}
          <span className="font-medium text-foreground">
            {formatRating(averageRating)}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Всего оценок:{" "}
          <span className="font-medium text-foreground">{totalRatings}</span>
        </p>
        {currentUserRating !== null ? (
          <p className="text-sm text-muted-foreground">
            Твоя оценка:{" "}
            <span className="font-medium text-foreground">{currentUserRating}/10</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 10 }, (_, index) => {
          const value = index + 1;
          const active = selectedRating === value;

          return (
            <button
              key={value}
              type="button"
              onClick={() => setSelectedRating(value)}
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full border text-sm font-medium transition",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground",
              )}
              aria-label={`Поставить оценку ${value} из 10`}
              disabled={accessState !== "ready" || isPending}
            >
              {value}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={submitRating}
          disabled={accessState !== "ready" || !selectedRating || isPending}
          className="gap-2"
        >
          <Star className="size-4" aria-hidden />
          Оценить
        </Button>

        {accessState === "guest" ? (
          <p className="text-sm text-muted-foreground">
            Оценки могут ставить только зарегистрированные пользователи.
          </p>
        ) : null}

        {accessState === "verified_required" ? (
          <p className="text-sm text-muted-foreground">
            Подтверди почту, чтобы ставить оценки.
          </p>
        ) : null}

        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </div>
  );
}
