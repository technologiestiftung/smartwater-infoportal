// app/api/mapfish/screenshot/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { appId, format = "png", spec } = await req.json();
  const base = process.env.MAPFISH_BASE_URL || "https://mapfishprint.ionos-main.ds-apps.tsb-berlin.de";
  if (!base) return new Response("MAPFISH_BASE_URL not set", { status: 500 });

// ${encodeURIComponent(appId)}/

  const url = `${base}` // /buildreport.${format}

  console.log('url :>> ', url);

  const r = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(spec),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    return new Response(`Mapfish error ${r.status}: ${txt}`, { status: 502 });
  }

  const bytes = await r.arrayBuffer();
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": format === "pdf" ? "application/pdf" : "image/png",
      "Cache-Control": "no-store",
    },
  });
}