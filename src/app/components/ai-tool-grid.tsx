import { type ApiToolListItem } from "@/app/lib/ai-utils";
import { AIToolCard } from "./ai-tool-card";

type Props = {
  tools: ApiToolListItem[];
};

export function AIToolGrid({ tools }: Props) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tools.map((tool) => (
        <AIToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
