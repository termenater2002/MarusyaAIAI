import { type AITool } from "@/app/data/ai";
import { AIToolCard } from "./ai-tool-card";

type Props = {
  tools: AITool[];
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
