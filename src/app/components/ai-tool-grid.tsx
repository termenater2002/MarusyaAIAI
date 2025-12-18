import { aiData } from "@/app/data/ai";
import { AIToolCard } from "./ai-tool-card";

export function AIToolGrid() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {aiData.map((tool) => (
        <AIToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );
}
