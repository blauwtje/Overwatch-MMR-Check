export async function GET() {
  const base = process.env.OVERFAST_BASE_URL ?? "https://overfast-api.tekrop.fr";
  try {
    const res = await fetch(`${base}/heroes`, { cache: "no-store" });
    return Response.json({ overfast: res.ok ? "reachable" : "unreachable", status: res.status });
  } catch (e) {
    return Response.json({ overfast: "error", error: String(e) }, { status: 502 });
  }
}
