import { aiData, type AITool } from "@/app/data/ai";

export function formatRating(rating: number): string {
  if (Number.isFinite(rating)) {
    return rating.toFixed(1);
  }

  return "—";
}

export const externalLinkProps = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const;

export function getToolById(id: number | string): AITool | undefined {
  const numericId = typeof id === "string" ? Number(id) : id;

  if (!Number.isFinite(numericId)) {
    return undefined;
  }

  return aiData.find((tool) => tool.id === numericId);
}

export function getInternalToolHref(id: number | string): string {
  const numericId = typeof id === "string" ? Number(id) : id;

  return `/ai/${numericId}`;
}
