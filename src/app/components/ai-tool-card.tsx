import { AITool } from "@/app/data/ai";
import { externalLinkProps, formatRating } from "@/app/lib/ai-utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  tool: AITool;
};

export function AIToolCard({ tool }: Props) {
  return (
    <Card className="h-full overflow-hidden">
      <div className="flex h-full flex-col">
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
              <a
                href={tool.url}
                className="text-lg font-semibold leading-tight hover:underline"
                {...externalLinkProps}
              >
                {tool.name}
              </a>
              <CardDescription className="text-sm text-muted-foreground">
                {tool.description}
              </CardDescription>
            </div>
            <span className="shrink-0 rounded-md bg-primary/10 px-2 py-1 text-sm font-semibold text-primary">
              {formatRating(tool.rating)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="mt-auto flex flex-wrap gap-2">
          {tool.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </CardContent>
      </div>
    </Card>
  );
}
