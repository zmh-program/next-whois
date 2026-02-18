import { HISTORY_LIMIT } from "@/lib/env";

export type HistoryItem = {
  query: string;
  timestamp: number;
  queryType: "domain" | "ipv4" | "ipv6" | "asn" | "cidr";
};

export function detectQueryType(query: string): HistoryItem["queryType"] {
  // IPv4 pattern
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(query)) return "ipv4";
  // IPv6 pattern
  if (/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/.test(query)) return "ipv6";
  // ASN pattern
  if (/^(AS|as)\d+$/.test(query)) return "asn";
  // CIDR pattern
  if (/^(\d{1,3}\.){3}\d{1,3}\/\d{1,2}$/.test(query)) return "cidr";
  // Default to domain
  return "domain";
}

// Helper function to check if localStorage is available
function isLocalStorageAvailable(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch {
    return false;
  }
}

export function listHistory(): HistoryItem[] {
  if (!isLocalStorageAvailable()) return [];

  try {
    const history = localStorage.getItem("history");
    if (!history || history === "[]") return [];

    const parsed = JSON.parse(history);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item: any) =>
          typeof item === "object" &&
          typeof item.query === "string" &&
          typeof item.timestamp === "number" &&
          typeof item.queryType === "string",
      )
      .map((item: HistoryItem) => ({
        ...item,
        query: item.query.trim(),
      }))
      .filter((item: HistoryItem) => item.query.length > 0);
  } catch (error) {
    console.warn("Failed to read history from localStorage:", error);
    return [];
  }
}

export function addHistory(query: string) {
  if (!query || query.length === 0 || !isLocalStorageAvailable()) return;

  try {
    let history = listHistory();
    const domain = query.trim();
    const newItem: HistoryItem = {
      query: domain,
      timestamp: Date.now(),
      queryType: detectQueryType(domain),
    };

    history = history.filter((item) => item.query !== domain);

    if (HISTORY_LIMIT < 0) {
      history = [newItem, ...history];
    } else {
      history = [newItem, ...history].slice(0, HISTORY_LIMIT);
    }
    localStorage.setItem("history", JSON.stringify(history));
  } catch (error) {
    console.warn("Failed to save history to localStorage:", error);
  }
}

export function removeHistory(query: string) {
  if (!query || query.length === 0 || !isLocalStorageAvailable()) return;

  try {
    let history = listHistory();
    const domain = query.trim();

    history = history.filter((item) => item.query !== domain);
    localStorage.setItem("history", JSON.stringify(history));
  } catch (error) {
    console.warn("Failed to remove history from localStorage:", error);
  }
}
