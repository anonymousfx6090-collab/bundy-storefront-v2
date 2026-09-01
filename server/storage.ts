import { put } from "@vercel/blob";

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream",
): Promise<{ key: string; url: string }> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Image storage is not configured. Add BLOB_READ_WRITE_TOKEN to the deployment environment.");
  }

  const pathname = appendHashSuffix(normalizeKey(relKey));
  const body = data instanceof Uint8Array ? Buffer.from(data) : data;
  const blob = await put(pathname, body, {
    access: "public",
    addRandomSuffix: false,
    contentType,
  });

  return { key: blob.pathname, url: blob.url };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: key.startsWith("http://") || key.startsWith("https://") ? key : `/manus-storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  if (relKey.startsWith("http://") || relKey.startsWith("https://")) return relKey;
  return `/manus-storage/${normalizeKey(relKey)}`;
}
