import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getEppStatusDisplayName } from "@/lib/whois/epp-status";

export const config = { runtime: "edge" };

function detectType(q: string): string {
  if (!q) return "unknown";
  if (/^AS\d+$/i.test(q)) return "ASN";
  if (/\/\d{1,3}$/.test(q)) return "CIDR";
  if (q.includes(":")) return "IPv6";
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(q)) return "IPv4";
  return "DOMAIN";
}

function getRelativeTime(dateStr: string): string {
  if (!dateStr || dateStr === "Unknown") return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays < 0) {
      const abs = Math.abs(diffDays);
      if (abs < 30) return `in ${abs}d`;
      if (abs < 365) return `in ${Math.floor(abs / 30)}mo`;
      return `in ${Math.floor(abs / 365)}y`;
    }
    if (diffDays < 1) return "today";
    if (diffDays < 30) return `${diffDays}d ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}mo ago`;
    return `${Math.floor(diffDays / 365)}y ago`;
  } catch {
    return "";
  }
}

function isValid(v: string | undefined | null): v is string {
  return !!v && v !== "Unknown" && v !== "N/A" && v !== "";
}

function formatDate(dateStr: string): string {
  if (!dateStr || dateStr === "Unknown") return "";
  try {
    return dateStr.split("T")[0];
  } catch {
    return dateStr;
  }
}

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query") || searchParams.get("q") || "";
  const w = Math.min(
    Math.max(parseInt(searchParams.get("w") || "1200") || 1200, 200),
    4096,
  );
  const h = Math.min(
    Math.max(parseInt(searchParams.get("h") || "630") || 630, 200),
    4096,
  );
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

  const queryType = query ? detectType(query) : "unknown";

  const typeBadgeColors: Record<string, { bg: string; fg: string }> = {
    DOMAIN: {
      bg: isDark ? "#1e3a5f" : "#dbeafe",
      fg: isDark ? "#60a5fa" : "#2563eb",
    },
    IPv4: {
      bg: isDark ? "#064e3b" : "#d1fae5",
      fg: isDark ? "#34d399" : "#059669",
    },
    IPv6: {
      bg: isDark ? "#2e1065" : "#ede9fe",
      fg: isDark ? "#a78bfa" : "#7c3aed",
    },
    ASN: {
      bg: isDark ? "#431407" : "#ffedd5",
      fg: isDark ? "#fb923c" : "#ea580c",
    },
    CIDR: {
      bg: isDark ? "#500724" : "#fce7f3",
      fg: isDark ? "#f472b6" : "#db2777",
    },
    unknown: { bg: subtleBg, fg: muted },
  };
  const typeBadge = typeBadgeColors[queryType] || typeBadgeColors.unknown;

  let registrar = "";
  let created = "";
  let expires = "";
  let updated = "";
  let statusList: string[] = [];
  let nsList: string[] = [];
  let age = "";
  let remainingDays: number | null = null;
  let dnssec = "";
  let whoisServer = "";
  let registrantOrg = "";
  let country = "";
  let hasDetails = false;

  if (query) {
    try {
      const origin = new URL(req.url).origin;
      const res = await fetch(
        `${origin}/api/lookup?query=${encodeURIComponent(query)}`,
      );
      const data = await res.json();
      if (data.status && data.result) {
        const r = data.result;
        if (isValid(r.registrar)) registrar = r.registrar;
        if (isValid(r.creationDate)) created = formatDate(r.creationDate);
        if (isValid(r.expirationDate)) expires = formatDate(r.expirationDate);
        if (isValid(r.updatedDate)) updated = formatDate(r.updatedDate);
        if (Array.isArray(r.status) && r.status.length > 0) {
          statusList = r.status
            .slice(0, 6)
            .map((s: { status: string }) => getEppStatusDisplayName(s.status));
        }
        if (Array.isArray(r.nameServers) && r.nameServers.length > 0) {
          nsList = r.nameServers.slice(0, 4);
        }
        if (r.domainAge != null) age = String(r.domainAge);
        if (r.remainingDays != null) remainingDays = r.remainingDays;
        if (isValid(r.dnssec)) dnssec = r.dnssec;
        if (isValid(r.whoisServer)) whoisServer = r.whoisServer;
        if (isValid(r.registrantOrganization))
          registrantOrg = r.registrantOrganization;
        if (isValid(r.registrantCountry)) country = r.registrantCountry;
        hasDetails = !!(registrar || created || expires);
      }
    } catch {}
  }

  const statusColor =
    remainingDays === null
      ? muted
      : remainingDays <= 0
        ? redColor
        : remainingDays <= 60
          ? amberColor
          : greenColor;
  const statusLabel =
    remainingDays === null
      ? "N/A"
      : remainingDays <= 0
        ? "EXPIRED"
        : remainingDays <= 60
          ? "EXPIRING SOON"
          : "ACTIVE";

  const createdRelative = created ? getRelativeTime(created) : "";
  const expiresRelative =
    remainingDays !== null
      ? remainingDays > 0
        ? `${remainingDays}d remaining`
        : "Expired"
      : expires
        ? getRelativeTime(expires)
        : "";
  const updatedRelative = updated ? getRelativeTime(updated) : "";

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
        {query && hasDetails ? (
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
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      padding: "3px 10px",
                      borderRadius: "4px",
                      backgroundColor: typeBadge.bg,
                      fontSize: "11px",
                      fontWeight: 700,
                      color: typeBadge.fg,
                      letterSpacing: "0.08em",
                    }}
                  >
                    {queryType}
                  </div>
                  {age && (
                    <div
                      style={{
                        padding: "3px 10px",
                        borderRadius: "4px",
                        backgroundColor: subtleBg,
                        fontSize: "11px",
                        fontWeight: 500,
                        color: muted,
                      }}
                    >
                      {`${age} ${parseInt(age) === 1 ? "year" : "years"}`}
                    </div>
                  )}
                </div>
                <span
                  style={{
                    fontSize: Math.min(
                      52,
                      Math.max(
                        28,
                        Math.floor((750 / Math.max(query.length, 1)) * 1.5),
                      ),
                    ),
                    fontWeight: 700,
                    color: fg,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  {query}
                </span>
                {registrar && (
                  <span
                    style={{
                      fontSize: "14px",
                      color: muted,
                      fontWeight: 400,
                      marginTop: "2px",
                    }}
                  >
                    {registrar}
                    {registrantOrg && registrantOrg !== registrar
                      ? ` · ${registrantOrg}`
                      : ""}
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: "6px",
                  marginLeft: "16px",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "5px 12px",
                    borderRadius: "8px",
                    backgroundColor: `${statusColor}18`,
                    border: `1px solid ${statusColor}40`,
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: statusColor,
                    }}
                  />
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: statusColor,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {statusLabel}
                  </span>
                </div>
                {remainingDays !== null && remainingDays > 0 && (
                  <span
                    style={{ fontSize: "11px", color: muted, fontWeight: 500 }}
                  >
                    {`${remainingDays}d remaining`}
                  </span>
                )}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                borderTop: `1px solid ${border}`,
                paddingTop: "16px",
                gap: "32px",
                flexWrap: "wrap",
              }}
            >
              {created && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: muted,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                    }}
                  >
                    CREATED
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: fg,
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {created}
                  </span>
                  {createdRelative && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 400,
                      }}
                    >
                      {createdRelative}
                    </span>
                  )}
                </div>
              )}
              {expires && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: muted,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                    }}
                  >
                    EXPIRES
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: fg,
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {expires}
                  </span>
                  {expiresRelative && (
                    <span
                      style={{
                        fontSize: "10px",
                        color:
                          remainingDays !== null && remainingDays > 60
                            ? greenColor
                            : muted,
                        fontWeight: 500,
                      }}
                    >
                      {expiresRelative}
                    </span>
                  )}
                </div>
              )}
              {updated && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "10px",
                      color: muted,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                    }}
                  >
                    UPDATED
                  </span>
                  <span
                    style={{
                      fontSize: "15px",
                      color: fg,
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {updated}
                  </span>
                  {updatedRelative && (
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 400,
                      }}
                    >
                      {updatedRelative}
                    </span>
                  )}
                </div>
              )}
            </div>

            {(registrantOrg || country) && (
              <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
                {registrantOrg && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      ORGANIZATION
                    </span>
                    <span
                      style={{ fontSize: "13px", color: fg, fontWeight: 500 }}
                    >
                      {registrantOrg}
                    </span>
                  </div>
                )}
                {country && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      COUNTRY
                    </span>
                    <span
                      style={{ fontSize: "13px", color: fg, fontWeight: 500 }}
                    >
                      {country}
                    </span>
                  </div>
                )}
              </div>
            )}

            {(statusList.length > 0 ||
              nsList.length > 0 ||
              dnssec ||
              whoisServer) && (
              <div style={{ display: "flex", gap: "28px", flexWrap: "wrap" }}>
                {statusList.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      STATUS
                    </span>
                    <div
                      style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                    >
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      NAMESERVERS
                    </span>
                    <div
                      style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                    >
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
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      DNSSEC
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: muted,
                        fontWeight: 500,
                        fontFamily: "monospace",
                      }}
                    >
                      {dnssec}
                    </span>
                  </div>
                )}
                {whoisServer && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "5px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        color: muted,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                      }}
                    >
                      WHOIS SERVER
                    </span>
                    <span
                      style={{
                        fontSize: "12px",
                        color: muted,
                        fontWeight: 500,
                        fontFamily: "monospace",
                      }}
                    >
                      {whoisServer}
                    </span>
                  </div>
                )}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: "4px",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
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
                <span
                  style={{ fontSize: "12px", color: muted, fontWeight: 500 }}
                >
                  next-whois-ui
                </span>
              </div>
              <span style={{ fontSize: "11px", color: accent }}>
                github.com/zmh-program/next-whois-ui
              </span>
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
              <span
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: fg,
                  letterSpacing: "0.05em",
                }}
              >
                NEXT WHOIS
              </span>
            </div>

            {query ? (
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
                    fontSize: Math.min(
                      72,
                      Math.max(
                        36,
                        Math.floor((1200 / Math.max(query.length, 1)) * 1.2),
                      ),
                    ),
                    fontWeight: 700,
                    color: fg,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                    textAlign: "center",
                    wordBreak: "break-all",
                  }}
                >
                  {query}
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <div
                    style={{
                      padding: "4px 14px",
                      borderRadius: "9999px",
                      backgroundColor: typeBadge.bg,
                      fontSize: "14px",
                      color: typeBadge.fg,
                      fontWeight: 600,
                    }}
                  >
                    {`${queryType} Lookup`}
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
              <span style={{ color: accent }}>
                github.com/zmh-program/next-whois-ui
              </span>
            </div>
          </div>
        )}
      </div>
    ),
    { width: w, height: h },
  );
}
