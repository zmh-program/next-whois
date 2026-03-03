import { cn, toSearchURI } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  RiDeleteBinLine,
  RiHistoryLine,
  RiGlobalLine,
  RiKeyboardLine,
} from "@remixicon/react";
import React, { useEffect, useMemo, useCallback } from "react";
import { detectQueryType, listHistory, removeHistory } from "@/lib/history";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SearchBox } from "@/components/search_box";
import { useTranslation, TranslationKey } from "@/lib/i18n";
import { motion } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

function KeyboardShortcut({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-sans font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded-[3px] mx-0.5 select-none">
      {k}
    </kbd>
  );
}

function ShortcutsList() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-0.5 p-1">
      {[
        { label: t("shortcut_search"), keys: ["/"] },
        { label: t("shortcut_clear"), keys: ["Esc"] },
        { label: t("shortcut_shortcuts"), keys: ["?"] },
      ].map((item, i) => (
        <div
          key={i}
          className="flex items-center justify-between px-2 py-1 rounded hover:bg-muted/50 transition-colors"
        >
          <span className="text-[10px] text-muted-foreground/80 font-medium">
            {item.label}
          </span>
          <div className="flex items-center">
            {item.keys.map((k, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && (
                  <span className="text-[9px] text-muted-foreground mx-0.5">
                    +
                  </span>
                )}
                <KeyboardShortcut k={k} />
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function QueryTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const config = {
    domain: {
      label: "",
      icon: RiGlobalLine,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    ipv4: {
      label: "4",
      icon: null,
      color: "text-emerald-600",
      bg: "bg-emerald-500/10",
    },
    ipv6: {
      label: "6",
      icon: null,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    asn: {
      label: "AS",
      icon: null,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    cidr: {
      label: "/",
      icon: null,
      color: "text-pink-500",
      bg: "bg-pink-500/10",
    },
  }[type] || {
    label: "?",
    icon: null,
    color: "text-gray-500",
    bg: "bg-gray-500/10",
  };

  if (config.icon) {
    const Icon = config.icon;
    return <Icon className={cn("w-3.5 h-3.5", config.color, className)} />;
  }
  return (
    <span className={cn("text-[9px] font-bold", config.color, className)}>
      {config.label}
    </span>
  );
}

function getDateGroupLabel(
  timestamp: number,
  t: (key: TranslationKey) => string,
): string {
  const date = new Date(timestamp);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const itemDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );

  if (itemDate.getTime() === today.getTime()) return t("today");
  if (itemDate.getTime() === yesterday.getTime()) return t("yesterday");
  if (date.getFullYear() === now.getFullYear()) return format(date, "MMM dd");
  return format(date, "MMM dd, yyyy");
}

export default function HomePage() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState(0);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const active = document.activeElement;
      const isInput =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.hasAttribute("contenteditable"));

      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById("main-search-input")?.focus();
        return;
      }
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }
      if (e.key === "Escape") {
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }
        const mainInput = document.getElementById("main-search-input");
        if (active === mainInput) mainInput?.blur();
        else if (active instanceof HTMLElement) active.blur();
        return;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  const handleSearch = useCallback((query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  }, []);

  const allHistory = useMemo(() => {
    if (!mounted) return [];
    return listHistory().sort((a, b) => b.timestamp - a.timestamp);
  }, [mounted, refreshTrigger]);

  const groupedHistory = useMemo(() => {
    const groups: { label: string; items: typeof allHistory }[] = [];
    if (allHistory.length === 0) return groups;
    let currentLabel = "";
    let currentGroup: typeof allHistory = [];
    for (const item of allHistory) {
      const label = getDateGroupLabel(item.timestamp, t);
      if (label !== currentLabel) {
        if (currentGroup.length > 0)
          groups.push({ label: currentLabel, items: currentGroup });
        currentLabel = label;
        currentGroup = [item];
      } else {
        currentGroup.push(item);
      }
    }
    if (currentGroup.length > 0)
      groups.push({ label: currentLabel, items: currentGroup });
    return groups;
  }, [allHistory]);

  const handleRemoveHistory = useCallback(
    (query: string) => {
      if (!mounted) return;
      removeHistory(query);
      setRefreshTrigger((prev) => prev + 1);
    },
    [mounted],
  );

  return (
    <ScrollArea className="w-full h-[calc(100vh-4rem)]">
      <main className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 min-h-[calc(100vh-4rem)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 relative group">
            <SearchBox onSearch={handleSearch} loading={loading} autoFocus />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
              <KeyboardShortcut k="/" />
            </div>
          </div>
          <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 text-muted-foreground"
                title="Keyboard Shortcuts (?)"
              >
                <RiKeyboardLine className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 p-0" sideOffset={5}>
              <ShortcutsList />
            </PopoverContent>
          </Popover>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {allHistory.length > 0 ? (
            <div className="space-y-1">
              {groupedHistory.map((group) => (
                <div key={group.label}>
                  <div className="flex items-center gap-3 py-2 px-1">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
                      {group.label}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={`${item.query}-${item.timestamp}`}
                      href={toSearchURI(item.query)}
                      onClick={() => handleSearch(item.query)}
                      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="w-7 h-7 rounded-md grid place-items-center border border-border bg-muted/20 group-hover:border-primary/30 shrink-0">
                        <QueryTypeIcon type={item.queryType} />
                      </div>
                      <span className="text-sm font-medium truncate flex-1 min-w-0">
                        {item.query}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] px-1.5 py-0 uppercase tracking-wider shrink-0"
                      >
                        {item.queryType}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
                        {format(item.timestamp, "h:mm a")}
                      </span>
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10 shrink-0"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleRemoveHistory(item.query);
                        }}
                      >
                        <RiDeleteBinLine className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
                      </button>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <RiHistoryLine className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {t("no_history_title")}
              </h3>
              <p className="text-xs text-muted-foreground/70">
                {t("no_history_description")}
              </p>
            </div>
          )}
        </motion.div>
      </main>
    </ScrollArea>
  );
}
