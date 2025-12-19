export function isPathActive(currentPath: string, href: string): boolean {
  const normalize = (value: string) => {
    if (!value) return "/";
    return value.endsWith("/") && value.length > 1
      ? value.slice(0, -1)
      : value;
  };

  const current = normalize(currentPath);
  const target = normalize(href);

  if (current === target) return true;

  if (target !== "/" && current.startsWith(`${target}/`)) {
    return true;
  }

  return false;
}
