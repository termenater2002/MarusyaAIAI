import { notFound } from "next/navigation";

import { getToolById, externalLinkProps, formatRating } from "@/app/lib/ai-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

type ToolPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AIToolDetailPage({ params }: ToolPageProps) {
  const { id } = await params;
  const tool = getToolById(id);

  if (!tool) {
    return notFound();
  }

  const hasFeatures = Array.isArray(tool.features) && tool.features.length > 0;
  const hasTags = Array.isArray(tool.tags) && tool.tags.length > 0;

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
            {formatRating(tool.rating)}
          </span>
          <Button asChild variant="outline" className="gap-2">
            <a
              href={tool.url}
              {...externalLinkProps}
              aria-label={`Открыть ${tool.name} во внешнем сайте`}
            >
              <ArrowUpRight className="size-4" />
              Внешний сайт
            </a>
          </Button>
        </div>
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
            {hasFeatures ? (
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                {tool.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">Фичи не указаны.</p>
            )}
          </section>
        </div>

        <div className="space-y-4">
          {tool.image ? (
            <div className="overflow-hidden rounded-lg border bg-muted">
              <img
                src={tool.image}
                alt={`Изображение для ${tool.name}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : (
            <div className="flex h-full min-h-[240px] items-center justify-center rounded-lg border bg-muted text-muted-foreground">
              Изображение отсутствует
            </div>
          )}

          <section className="space-y-2 rounded-lg border bg-card p-4 shadow-sm">
            <h3 className="text-lg font-semibold">Теги</h3>
            {hasTags ? (
              <div className="flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
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
    </div>
  );
}
