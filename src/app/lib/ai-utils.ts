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
