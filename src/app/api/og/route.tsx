import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "AsiaPicks").slice(0, 110);
  const eyebrow = (searchParams.get("eyebrow") ?? "South Korea travel").slice(0, 40);
  return new ImageResponse(
    (
      <div style={{ width: "1200px", height: "630px", display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "72px", background: "linear-gradient(135deg, #0F766E 0%, #0D9488 55%, #14B8A6 100%)", color: "white" }}>
        <div style={{ fontSize: 30, letterSpacing: 2, textTransform: "uppercase", opacity: 0.85 }}>{eyebrow}</div>
        <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>{title}</div>
        <div style={{ fontSize: 32, fontWeight: 700 }}>AsiaPicks</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
