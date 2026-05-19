import { NextRequest } from "next/server";
import { fetchPlayerData } from "@/lib/fetch-player";
import type { Platform, Gamemode } from "@/lib/algorithm/types";

// BattleTag in URL uses dash instead of hash: Name-1234
const BATTLETAG_REGEX = /^[\p{L}\d]{2,12}-\d{4,8}$/u;

function parsePlatform(raw: string | null): Platform {
  if (raw === "console" || raw === "mixed" || raw === "pc") return raw;
  return "pc";
}

function parseGamemode(raw: string | null): Gamemode {
  if (raw === "unranked" || raw === "both" || raw === "ranked") return raw;
  return "ranked";
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tag: string }> }
) {
  const { tag } = await params;
  const platform = parsePlatform(_req.nextUrl.searchParams.get("platform"));
  const gamemode = parseGamemode(_req.nextUrl.searchParams.get("gamemode"));

  if (!BATTLETAG_REGEX.test(tag)) {
    return Response.json(
      { error: "Invalid BattleTag format. Expected Name-1234 (dash instead of #)." },
      { status: 422 }
    );
  }

  const data = await fetchPlayerData(tag, platform, gamemode);

  if (data.status === "not_found") {
    return Response.json({ error: "Player not found. Check the BattleTag." }, { status: 404 });
  }
  if (data.status === "private") {
    return Response.json(
      {
        error: "private",
        username: data.username,
        message:
          "This player has set their career to private. They can change it at battle.net/account/management/profile-privacy.",
      },
      { status: 403 }
    );
  }
  if (data.status === "rate_limited") {
    return Response.json({ error: "API rate limit hit. Try again in a moment." }, { status: 429 });
  }
  if (data.status === "error") {
    return Response.json({ error: data.message }, { status: 502 });
  }

  return Response.json(
    {
      username: data.username,
      avatar: data.avatar,
      platform: data.platform,
      gamemode: data.gamemode,
      season: data.season,
      mmr: data.mmr,
      statsPartial: data.statsPartial,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    }
  );
}
