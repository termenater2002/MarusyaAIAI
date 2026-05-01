export type ApiToolListItem = {
  id: number;
  name: string;
  entityType: string;
  url: string;
  imageUrl: string | null;
  description: string;
  editorialRating: number | null;
  averageUserRating?: number | null;
  userRatingCount?: number;
  worksInRussia: boolean | null;
  needsVPN: boolean | null;
  requiresRegistration: boolean | null;
  isFree: boolean | null;
  tags: string[];
};

export type ApiToolDetail = ApiToolListItem & {
  longDescription: string | null;
  categories: Array<{
    id: number;
    name: string | null;
  }>;
  features: string[];
  ratingSummary: {
    averageUserRating: number | null;
    userRatingCount: number;
  };
};

const LOGO_DEV_TOKEN = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN;

export function formatRating(rating: number | null | undefined): string {
  if (typeof rating === "number" && Number.isFinite(rating)) {
    return rating.toFixed(1);
  }

  return "—";
}

export function getDisplayRating(
  tool: Pick<ApiToolListItem, "editorialRating" | "averageUserRating">
) {
  const averageUserRating = Number(tool.averageUserRating);
  if (Number.isFinite(averageUserRating)) {
    return averageUserRating;
  }

  const editorialRating = Number(tool.editorialRating);
  return Number.isFinite(editorialRating) ? editorialRating : null;
}

export const externalLinkProps = {
  target: "_blank",
  rel: "noreferrer noopener",
} as const;

export function getInternalToolHref(id: number | string): string {
  const numericId = typeof id === "string" ? Number(id) : id;

  return `/ai/${numericId}`;
}

export function getDomainFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return null;
  }
}

export function getLogoDevUrl(url: string, options?: { size?: number; theme?: "light" | "dark" | "auto" }) {
  if (!LOGO_DEV_TOKEN) {
    return null;
  }

  const domain = getDomainFromUrl(url);
  if (!domain) {
    return null;
  }

  const params = new URLSearchParams({
    token: LOGO_DEV_TOKEN,
    format: "png",
    retina: "true",
    fallback: "404",
  });

  if (options?.size) {
    params.set("size", String(options.size));
  }

  if (options?.theme) {
    params.set("theme", options.theme);
  }

  return `https://img.logo.dev/${domain}?${params.toString()}`;
}

export function getImageProxyUrl(src: string) {
  if (!src.startsWith("http://") && !src.startsWith("https://")) {
    return src;
  }

  return `/api/image-proxy?src=${encodeURIComponent(src)}`;
}

export function getPreferredToolImage(
  tool: Pick<ApiToolListItem, "imageUrl" | "url">,
  options?: { size?: number; theme?: "light" | "dark" | "auto" },
) {
  const directImage = tool.imageUrl || getLogoDevUrl(tool.url, options) || "/error.png";
  return getImageProxyUrl(directImage);
}
