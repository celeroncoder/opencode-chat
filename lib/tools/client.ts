import { env } from "../env";

export async function callToolsServer<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const url = `${env.TOOLS_SERVER_URL.replace(/\/$/, "")}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Tools server ${path} failed: ${res.status} ${res.statusText} ${text}`,
    );
  }

  return (await res.json()) as T;
}
