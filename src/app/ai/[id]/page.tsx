import { notFound } from "next/navigation";

import { getPool } from "@/lib/server/db";
import {
  externalLinkProps,
  formatRating,
  getDisplayRating,
  getPreferredToolImage,
} from "@/app/lib/ai-utils";
import { FavoriteToggleButton } from "@/components/favorite-toggle-button";
import { ToolExportActions } from "@/components/tool-export-actions";
import { ToolImage } from "@/components/tool-image";
import { ToolRatingForm } from "@/components/tool-rating-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type ToolPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function toNullableNumber(value: unknown) {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

export default async function AIToolDetailPage({ params }: ToolPageProps) {
  const { id } = await params;
  const toolId = Number(id);

  if (!Number.isFinite(toolId)) {
    return notFound();
  }

  const pool = getPool();
  const toolResult = await pool.query(
    `SELECT
      id,
      name,
      entity_type AS "entityType",
      url,
      image_url AS "imageUrl",
      short_description AS description,
      long_description AS "longDescription",
      editorial_rating AS "editorialRating"
    FROM ai_tools
    WHERE id = $1
    LIMIT 1`,
    [toolId],
  );

  const tool = toolResult.rows[0];

  if (!tool) {
    return notFound();
  }

  const [tagsResult, featuresResult, ratingSummaryResult] = await Promise.all([
    pool.query(
      `SELECT tag_name AS name
       FROM ai_tool_tags
       WHERE tool_id = $1
       ORDER BY tag_name`,
      [toolId],
    ),
    pool.query(
      `SELECT feature_text AS text
       FROM ai_tool_features
       WHERE tool_id = $1
       ORDER BY position_index`,
      [toolId],
    ),
    pool.query(
      `SELECT
        ROUND(AVG(rating_value)::numeric, 2) AS "averageUserRating",
        COUNT(*)::int AS "userRatingCount"
       FROM user_ratings
       WHERE tool_id = $1`,
      [toolId],
    ),
  ]);

  const tags = tagsResult.rows.map((tag) => tag.name as string);
  const features = featuresResult.rows.map((feature) => feature.text as string);
  const ratingSummaryRow = ratingSummaryResult.rows[0] as {
    averageUserRating: unknown;
    userRatingCount: unknown;
  };
  const ratingSummary = {
    averageUserRating: toNullableNumber(ratingSummaryRow?.averageUserRating),
    userRatingCount: Number(ratingSummaryRow?.userRatingCount ?? 0),
  };
  const imageSrc = getPreferredToolImage(
    {
      imageUrl: (tool.imageUrl as string | null) ?? null,
      url: tool.url as string,
    },
    { size: 512, theme: "dark" },
  );
  const displayRating = getDisplayRating({
    editorialRating: (tool.editorialRating as number | null) ?? null,
    averageUserRating: ratingSummary.averageUserRating,
  });

  return (
    <div className="site-container flex flex-col gap-8 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            AI инструмент
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            {tool.name}
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground">
            {tool.description || "Описание недоступно."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
            {formatRating(displayRating)}
          </span>
          <FavoriteToggleButton toolId={tool.id as number} />
          <Button asChild variant="outline" className="gap-2">
            <a
              href={tool.url}
              {...externalLinkProps}
              aria-label={`Открыть ссылку на инструмент ${tool.name}`}
            >
              <ArrowUpRight className="size-4" />
              Ссылка на инструмент
            </a>
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-muted">
        <ToolImage
          src={imageSrc}
          alt={`Изображение для ${tool.name}`}
          className="h-40 w-full object-cover sm:h-48 lg:h-56"
          loading="lazy"
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
            <h2 className="text-lg font-semibold">Подробно</h2>
            <p className="text-base leading-relaxed text-muted-foreground">
              {tool.longDescription || "Дополнительное описание отсутствует."}
            </p>
          </section>

          <section className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Ключевые фичи</h3>
            {features.length > 0 ? (
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Фичи не указаны.</p>
            )}
          </section>

          <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Оценки пользователей</h3>
            <ToolRatingForm
              toolId={tool.id as number}
              initialAverageRating={ratingSummary.averageUserRating}
              initialTotalRatings={ratingSummary.userRatingCount}
            />
          </section>
        </div>

        <div className="space-y-4">
          <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Теги</h3>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Теги не указаны.</p>
            )}
          </section>
        </div>
      </div>

      <div className="border-t border-border/50 pt-2">
        <ToolExportActions
          tool={{
            id: tool.id as number,
            name: tool.name as string,
            entityType: tool.entityType as string,
            url: tool.url as string,
            description: (tool.description as string | null) ?? null,
            longDescription: (tool.longDescription as string | null) ?? null,
            editorialRating: (tool.editorialRating as number | null) ?? null,
          }}
          tags={tags}
          features={features}
          ratingSummary={ratingSummary}
        />
      </div>
    </div>
  );
}
