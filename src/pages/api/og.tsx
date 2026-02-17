import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const config = { runtime: "edge" };

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const domain = searchParams.get("domain");
  const registrar = searchParams.get("registrar");
  const created = searchParams.get("created");
  const expires = searchParams.get("expires");
  const updated = searchParams.get("updated");
  const status = searchParams.get("status");
  const ns = searchParams.get("ns");
  const age = searchParams.get("age");
  const remaining = searchParams.get("remaining");
  const dnssec = searchParams.get("dnssec");
  const whoisServer = searchParams.get("whoisServer");
  const registrantOrg = searchParams.get("registrantOrg");
  const country = searchParams.get("country");
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
  const subtleBg = isDark ? "#27272a" : "#f4f4f5";
  const greenColor = isDark ? "#4ade80" : "#16a34a";
  const redColor = "#ef4444";
  const amberColor = isDark ? "#fbbf24" : "#d97706";

  const hasDetails = registrar || created || expires;
  const statusList = status ? status.split(",").slice(0, 6) : [];
  const nsList = ns ? ns.split(",").slice(0, 4) : [];
  const remainingDays = remaining ? parseInt(remaining) : null;

  const statusColor = remainingDays === null ? muted : remainingDays <= 0 ? redColor : remainingDays <= 60 ? amberColor : greenColor;
  const statusLabel = remainingDays === null ? "N/A" : remainingDays <= 0 ? "EXPIRED" : remainingDays <= 60 ? "EXPIRING SOON" : "ACTIVE";

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
          padding: "40px",
          position: "relative",
        }}
      >
        {domain && hasDetails ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "1000px",
              backgroundColor: cardBg,
              border: `1px solid ${border}`,
              borderRadius: "16px",
              padding: "36px 44px",
              gap: "20px",
              boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <div
                    style={{
                      padding: "2px 8px",
                      borderRadius: "4px",
                      backgroundColor: subtleBg,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: muted,
                      letterSpacing: "0.08em",
                    }}
                  >
                    WHOIS
                  </div>
                  {age && (
                    <div
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        backgroundColor: subtleBg,
                        fontSize: "11px",
                        fontWeight: 500,
                        color: muted,
                      }}
                    >
                      {age} {parseInt(age) === 1 ? "year" : "years"}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: Math.min(52, Math.max(28, Math.floor(750 / Math.max(domain.length, 1) * 1.5))),
                    fontWeight: 700,
                    color: fg,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {domain}
                </span>
                {registrar && (
                  <span style={{ fontSize: "14px", color: muted, fontWeight: 400, marginTop: "2px" }}>
                    {registrar}{registrantOrg && registrantOrg !== registrar ? ` · ${registrantOrg}` : ""}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", marginLeft: "16px", flexShrink: 0 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    backgroundColor: `${statusColor}18`,
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: statusColor }} />
                  <span style={{ fontSize: "11px", fontWeight: 700, color: statusColor, letterSpacing: "0.04em" }}>{statusLabel}</span>
                </div>
                {remainingDays !== null && remainingDays > 0 && (
                  <span style={{ fontSize: "11px", color: muted, fontWeight: 500 }}>
                    {remainingDays}d remaining
                  </span>
                )}
              </div>
            </div>

            <div style={{ display: "flex", borderTop: `1px solid ${border}`, paddingTop: "16px", gap: "28px", flexWrap: "wrap" }}>
              {created && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>CREATED</span>
                  <span style={{ fontSize: "15px", color: fg, fontWeight: 600, fontFamily: "monospace" }}>{created}</span>
                </div>
              )}
              {expires && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>EXPIRES</span>
                  <span style={{ fontSize: "15px", color: fg, fontWeight: 600, fontFamily: "monospace" }}>{expires}</span>
                </div>
              )}
              {updated && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>UPDATED</span>
                  <span style={{ fontSize: "15px", color: fg, fontWeight: 600, fontFamily: "monospace" }}>{updated}</span>
                </div>
              )}
              {country && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>COUNTRY</span>
                  <span style={{ fontSize: "15px", color: fg, fontWeight: 600 }}>{country}</span>
                </div>
              )}
              {whoisServer && (
                <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>WHOIS SERVER</span>
                  <span style={{ fontSize: "13px", color: muted, fontWeight: 500, fontFamily: "monospace" }}>{whoisServer}</span>
                </div>
              )}
            </div>

            {(statusList.length > 0 || nsList.length > 0 || dnssec) && (
              <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                {statusList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>STATUS</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {statusList.map((s) => (
                        <div
                          key={s}
                          style={{
                            padding: "2px 7px",
                            borderRadius: "4px",
                            backgroundColor: subtleBg,
                            fontSize: "10px",
                            color: muted,
                            fontWeight: 500,
                            fontFamily: "monospace",
                          }}
                        >
                          {s.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {nsList.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>NAMESERVERS</span>
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {nsList.map((n) => (
                        <div
                          key={n}
                          style={{
                            padding: "2px 7px",
                            borderRadius: "4px",
                            backgroundColor: subtleBg,
                            fontSize: "10px",
                            color: muted,
                            fontWeight: 500,
                            fontFamily: "monospace",
                          }}
                        >
                          {n.trim()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {dnssec && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                    <span style={{ fontSize: "10px", color: muted, fontWeight: 600, letterSpacing: "0.06em" }}>DNSSEC</span>
                    <span style={{ fontSize: "12px", color: muted, fontWeight: 500, fontFamily: "monospace" }}>{dnssec}</span>
                  </div>
                )}
              </div>
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    backgroundColor: fg,
                    color: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 700,
                  }}
                >
                  W
                </div>
                <span style={{ fontSize: "12px", color: muted, fontWeight: 500 }}>next-whois-ui</span>
              </div>
              <span style={{ fontSize: "11px", color: accent }}>github.com/zmh-program/next-whois-ui</span>
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
                  width: "44px",
                  height: "44px",
                  backgroundColor: fg,
                  color: bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                W
              </div>
              <span style={{ fontSize: "22px", fontWeight: 600, color: fg, letterSpacing: "0.05em" }}>NEXT WHOIS</span>
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
                  <div style={{ padding: "4px 14px", borderRadius: "9999px", border: `1px solid ${border}`, fontSize: "14px", color: muted }}>
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
