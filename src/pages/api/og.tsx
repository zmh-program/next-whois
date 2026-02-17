import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const registrar = searchParams.get("registrar");
  const created = searchParams.get("created");
  const expires = searchParams.get("expires");
  const status = searchParams.get("status");
  const ns = searchParams.get("ns");
  const w = Math.min(Math.max(parseInt(searchParams.get("w") || "1200") || 1200, 200), 4096);
  const h = Math.min(Math.max(parseInt(searchParams.get("h") || "630") || 630, 200), 4096);
  const theme = searchParams.get("theme") === "dark" ? "dark" : "light";

  const isDark = theme === "dark";
  const bg = isDark ? "#09090b" : "#fafafa";
  const fg = isDark ? "#fafafa" : "#18181b";
  const muted = isDark ? "#a1a1aa" : "#71717a";
  const border = isDark ? "#27272a" : "#e4e4e7";
  const accent = isDark ? "#3b82f6" : "#2563eb";
  const cardBg = isDark ? "#18181b" : "#ffffff";

  const hasDetails = registrar || created || expires;
  const statusList = status ? status.split(",").slice(0, 4) : [];
  const nsList = ns ? ns.split(",").slice(0, 4) : [];

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
          padding: "48px",
          position: "relative",
        }}
      >
        {domain && hasDetails ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "960px",
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "40px 48px",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: "9999px",
                      border: `1px solid ${border}`,
                      fontSize: "12px",
                      fontWeight: 600,
                      color: muted,
                      letterSpacing: "0.05em",
                    }}
                  >
                    WHOIS
                  </div>
                </div>
                <span
                  style={{
                    fontSize: Math.min(56, Math.max(32, Math.floor(800 / Math.max(domain.length, 1) * 1.5))),
                    fontWeight: 700,
                    color: fg,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {domain}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    backgroundColor: fg,
                    color: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "6px",
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  W
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
              {registrar && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: muted, fontWeight: 600, letterSpacing: "0.05em" }}>REGISTRAR</span>
                  <span style={{ fontSize: "16px", color: fg, fontWeight: 500 }}>{registrar}</span>
                </div>
              )}
              {created && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: muted, fontWeight: 600, letterSpacing: "0.05em" }}>CREATED</span>
                  <span style={{ fontSize: "16px", color: fg, fontWeight: 500 }}>{created}</span>
                </div>
              )}
              {expires && (
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "11px", color: muted, fontWeight: 600, letterSpacing: "0.05em" }}>EXPIRES</span>
                  <span style={{ fontSize: "16px", color: fg, fontWeight: 500 }}>{expires}</span>
                </div>
              )}
            </div>

            {(statusList.length > 0 || nsList.length > 0) && (
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                {statusList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: muted, fontWeight: 600, letterSpacing: "0.05em" }}>STATUS</span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {statusList.map((s) => (
                        <div
                          key={s}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                            fontSize: "11px",
                            color: muted,
                            fontWeight: 500,
                          }}
                        >
                          {s.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nsList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "11px", color: muted, fontWeight: 600, letterSpacing: "0.05em" }}>NAMESERVERS</span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {nsList.map((n) => (
                        <div
                          key={n}
                          style={{
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: isDark ? "#27272a" : "#f4f4f5",
                            fontSize: "11px",
                            color: muted,
                            fontWeight: 500,
                          }}
                        >
                          {n.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "4px" }}>
              <span style={{ fontSize: "12px", color: muted }}>next-whois-ui</span>
              <span style={{ fontSize: "12px", color: border }}>·</span>
              <span style={{ fontSize: "12px", color: accent }}>github.com/zmh-program/next-whois-ui</span>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
              <span style={{ fontSize: "20px", fontWeight: 600, color: fg, letterSpacing: "0.05em" }}>NEXT WHOIS</span>
            </div>

            {domain ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
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
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div style={{ padding: "4px 12px", borderRadius: "9999px", border: `1px solid ${border}`, fontSize: "14px", color: muted }}>
                    WHOIS Lookup
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "48px", fontWeight: 700, color: fg, letterSpacing: "-0.02em" }}>WHOIS Lookup Tool</span>
                <span style={{ fontSize: "18px", color: muted, textAlign: "center", maxWidth: "600px" }}>Domain / IPv4 / IPv6 / ASN / CIDR</span>
              </div>
            )}

            <div style={{ position: "absolute", bottom: "30px", display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: muted }}>
              <span>next-whois-ui</span>
              <span style={{ color: border }}>·</span>
              <span style={{ color: accent }}>github.com/zmh-program/next-whois-ui</span>
            </div>
          </div>
        )}
      </div>
    ),
    { width: w, height: h },
  );
}
