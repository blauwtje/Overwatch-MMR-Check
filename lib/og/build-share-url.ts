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
