import { headers } from "next/headers";

export async function buildShareUrl(
  tag: string,
  platform: string,
  gamemode: string
): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "owmmr.app";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const qs = new URLSearchParams();
  if (platform !== "pc") qs.set("platform", platform);
  if (gamemode !== "ranked") qs.set("gamemode", gamemode);
  const qsStr = qs.toString();
  return `${proto}://${host}/player/${tag}${qsStr ? `?${qsStr}` : ""}`;
}

export function buildOgUrl(
  host: string,
  proto: string,
  tag: string,
  platform: string,
  gamemode: string
): string {
  const qs = new URLSearchParams({ platform, gamemode });
  return `${proto}://${host}/og/${tag}?${qs}`;
}
