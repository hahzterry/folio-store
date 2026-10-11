const PRINTIFY_API_BASE = "https://api.printify.com/v1";

export async function printifyFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const token = process.env.PRINTIFY_API_TOKEN?.trim();

  if (!token) {
    throw new Error("Missing PRINTIFY_API_TOKEN environment variable");
  }

  if (!path || typeof path !== "string") {
    throw new Error("A valid Printify API path is required");
  }

  // Accept paths such as /shops.json or /shops/123/products.json.
  // Prevent accidentally requesting a different host.
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (normalizedPath.startsWith("//") || normalizedPath.includes("://")) {
    throw new Error("Invalid Printify API path");
  }

  const url = `${PRINTIFY_API_BASE}${normalizedPath}`;

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("Accept", "application/json");

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...init,
    headers,
    cache: "no-store",
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("Printify API request failed:", {
      status: response.status,
      statusText: response.statusText,
      path: normalizedPath,
      details: responseText,
    });

    throw new Error(
      `Printify API returned ${response.status}: ${
        responseText || response.statusText
      }`,
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(`Printify returned invalid JSON for ${normalizedPath}`);
  }
}
