import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "edge";

const CITY_IMAGES: Record<string, string> = {
  tokyo: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=1200&q=60",
  osaka: "https://images.unsplash.com/photo-1590559899731-a382839e5549?w=1200&q=60",
  bangkok: "https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=1200&q=60",
  kyoto: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=60",
  seoul: "https://images.unsplash.com/photo-1538485399081-7191377e8241?w=1200&q=60",
  hanoi: "https://images.unsplash.com/photo-1557750255-c76072a7aad1?w=1200&q=60",
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Asiapicks";
  const city = searchParams.get("city") ?? "";
  const subtitle = searchParams.get("subtitle") ?? "";

  const bgImage = CITY_IMAGES[city.toLowerCase()] ?? null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          fontFamily: "sans-serif",
          overflow: "hidden",
          backgroundColor: "#0D1B1A",
        }}
      >
        {/* Background image */}
        {bgImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={bgImage}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
            }}
          />
        )}

        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(13,148,136,0.7) 0%, rgba(7,36,35,0.85) 100%)",
          }}
        />

        {/* Decorative circle */}
        <div
          style={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "rgba(20,184,166,0.12)",
            border: "1px solid rgba(20,184,166,0.2)",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 72px",
            height: "100%",
          }}
        >
          {/* Top — Brand */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "#0D9488",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "0.05em",
              }}
            >
              ASIAPICKS
            </span>
          </div>

          {/* Middle — Title */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {city && (
              <span
                style={{
                  color: "#5EEAD4",
                  fontSize: "22px",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                {city.charAt(0).toUpperCase() + city.slice(1)}
              </span>
            )}
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: title.length > 50 ? "46px" : "58px",
                fontWeight: 800,
                lineHeight: 1.15,
                margin: 0,
                maxWidth: "900px",
              }}
            >
              {title}
            </h1>
            {subtitle && (
              <p
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "26px",
                  margin: 0,
                  lineHeight: 1.4,
                  maxWidth: "700px",
                }}
              >
                {subtitle}
              </p>
            )}
          </div>

          {/* Bottom — URL */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: 40,
                height: 3,
                backgroundColor: "#0D9488",
                borderRadius: "2px",
              }}
            />
            <span
              style={{
                color: "rgba(255,255,255,0.45)",
                fontSize: "18px",
              }}
            >
              asiapicks.com
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
