import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const w = Math.min(Math.max(parseInt(searchParams.get("w") || "1200") || 1200, 200), 4096);
  const h = Math.min(Math.max(parseInt(searchParams.get("h") || "630") || 630, 200), 4096);
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

  const isDark = theme === "dark";
  const bg = isDark ? "#09090b" : "#fafafa";
  const fg = isDark ? "#fafafa" : "#18181b";
  const muted = isDark ? "#a1a1aa" : "#71717a";
  const border = isDark ? "#27272a" : "#e4e4e7";
  const accent = isDark ? "#3b82f6" : "#2563eb";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: bg,
          backgroundImage: `radial-gradient(${isDark ? "#27272a" : "#d4d4d8"} 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
          padding: "60px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                backgroundColor: fg,
                color: bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "6px",
                fontSize: "20px",
                fontWeight: 700,
              }}
            >
              W
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: 600,
                color: fg,
                letterSpacing: "0.05em",
              }}
            >
              NEXT WHOIS
            </span>
          </div>

          {domain ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <span
                style={{
                  fontSize: Math.min(72, Math.max(36, Math.floor(1200 / Math.max(domain.length, 1) * 1.2))),
                  fontWeight: 700,
                  color: fg,
                  letterSpacing: "-0.02em",
                  lineHeight: 1.1,
                  textAlign: "center",
                  wordBreak: "break-all",
                }}
              >
                {domain}
              </span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    border: `1px solid ${border}`,
                    fontSize: "14px",
                    color: muted,
                  }}
                >
                  WHOIS Lookup
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <span
                style={{
                  fontSize: "48px",
                  fontWeight: 700,
                  color: fg,
                  letterSpacing: "-0.02em",
                }}
              >
                WHOIS Lookup Tool
              </span>
              <span
                style={{
                  fontSize: "18px",
                  color: muted,
                  textAlign: "center",
                  maxWidth: "600px",
                }}
              >
                Domain / IPv4 / IPv6 / ASN / CIDR
              </span>
            </div>
          )}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "30px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "14px",
            color: muted,
          }}
        >
          <span>next-whois-ui</span>
          <span style={{ color: border }}>·</span>
          <span style={{ color: accent }}>github.com/zmh-program/next-whois-ui</span>
        </div>
      </div>
    ),
    { width: w, height: h },
  );
}
