import Link from "next/link";

import { AITool } from "@/app/data/ai";
import {
  externalLinkProps,
  formatRating,
  getInternalToolHref,
} from "@/app/lib/ai-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight } from "lucide-react";

type Props = {
  tool: AITool;
};

export function AIToolCard({ tool }: Props) {
  const internalHref = getInternalToolHref(tool.id);

  return (
    <Card className="relative h-full overflow-hidden">
      <Link
        href={internalHref}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <div className="relative aspect-[3/2] overflow-hidden bg-muted">
          <img
            src={tool.image}
            alt={`Иллюстрация для ${tool.name}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        <CardHeader className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 space-y-2">
              <CardTitle className="text-lg leading-tight">{tool.name}</CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {tool.description}
              </CardDescription>
            </div>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
              {formatRating(tool.rating)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="mt-auto flex flex-wrap gap-2 pr-14">
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </Link>

      <div className="pointer-events-auto absolute bottom-4 right-4">
        <Button
          asChild
          size="icon"
          variant="outline"
          className="shadow-sm"
        >
          <a
            href={tool.url}
            aria-label={`Открыть ${tool.name} во внешнем сайте в новой вкладке`}
            {...externalLinkProps}
          >
            <ArrowUpRight className="size-4" />
          </a>
        </Button>
      </div>
    </Card>
  );
}
