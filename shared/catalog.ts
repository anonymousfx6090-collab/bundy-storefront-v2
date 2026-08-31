export function toProductSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 96) || "untitled-product";
}

export function isTemuLink(value: string) {
  try {
    const hostname = new URL(value).hostname.toLowerCase();
    return hostname === "temu.com" || hostname.endsWith(".temu.com") || hostname === "temu.to";
  } catch {
    return false;
  }
}

export function safeImageFilename(value: string) {
  const cleaned = value.toLowerCase().replace(/[^a-z0-9.]+/g, "-").replace(/(^-|-$)/g, "");
  return cleaned || "product-image";
}
