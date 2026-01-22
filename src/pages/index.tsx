import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RiArrowRightSLine,
  RiLinkM,
  RiSearchLine,
  RiDeleteBinLine,
  RiArrowGoBackLine,
  RiFilterLine,
  RiTimeLine,
  RiSortAsc,
  RiSortDesc,
  RiHistoryLine,
  RiInformationLine,
  RiArrowLeftSLine,
  RiSparklingLine,
  RiGlobalLine,
  RiKeyboardLine,
  RiCommandFill,
} from "@remixicon/react";
import React, { useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { cn, toSearchURI } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";
import {
  HistoryItem,
  listHistory,
  removeHistory,
  searchHistory,
} from "@/lib/history";
import Icon from "@/components/icon";
import Clickable from "@/components/motion/clickable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SearchBox } from "@/components/search_box";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { motion, AnimatePresence } from "framer-motion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

function KeyboardShortcut({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-sans font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded-[3px] mx-0.5 select-none">
      {k}
    </kbd>
  );
}

function ShortcutsList() {
  return (
    <div className="grid gap-0.5 p-1">
      {[
        { label: "Search", keys: ["/"] },
        { label: "Clear / Blur", keys: ["Esc"] },
        { label: "Sort", keys: ["Alt", "S"] },
        { label: "Filter", keys: ["Alt", "F"] },
        { label: "Shortcuts", keys: ["?"] },
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

export default function Home() {
  const { t } = useTranslation();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [trashMode, setTrashMode] = React.useState<boolean>(false);
  const [searchTerm, setSearchTerm] = React.useState<string>("");
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("desc");
  const [selectedType, setSelectedType] = React.useState<string>("all");
  const [currentPage, setCurrentPage] = React.useState<number>(1);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = React.useState<number>(0);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const itemsPerPage = 5;

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

      // Focus Search: /
      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById("main-search-input")?.focus();
        return;
      }

      // Shortcuts: ? (Shift + /)
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
        return;
      }

      // Escape
      if (e.key === "Escape") {
        // Close shortcuts first if open
        if (showShortcuts) {
          setShowShortcuts(false);
          return;
        }

        const mainInput = document.getElementById("main-search-input");
        if (active === mainInput) {
          if ((mainInput as HTMLInputElement).value) {
            mainInput?.blur();
          } else {
            mainInput?.blur();
          }
        } else if (active instanceof HTMLElement) {
          active.blur();
        }
        setSearchTerm("");
        return;
      }

      // Sort: Alt+S
      if (e.key.toLowerCase() === "s" && e.altKey) {
        e.preventDefault();
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      }

      // Filter: Alt+F
      if (e.key.toLowerCase() === "f" && e.altKey) {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showShortcuts]);

  const processedHistory = useMemo(() => {
    if (!mounted) return [];

    const items = searchTerm ? searchHistory(searchTerm) : listHistory();
    const filtered =
      selectedType === "all"
        ? items
        : items.filter((item) => item.queryType === selectedType);

    return [...filtered].sort((a, b) => {
      return sortOrder === "desc"
        ? b.timestamp - a.timestamp
        : a.timestamp - b.timestamp;
    });
  }, [mounted, searchTerm, sortOrder, selectedType, refreshTrigger]);

  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(processedHistory.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = processedHistory.slice(startIndex, endIndex);

    return {
      totalPages,
      currentItems,
      hasItems: processedHistory.length > 0,
      hasPagination: processedHistory.length > itemsPerPage,
    };
  }, [processedHistory, currentPage, itemsPerPage]);

  const handleSearch = useCallback((query: string) => {
    setLoading(true);
    window.location.href = toSearchURI(query);
  }, []);

  const getTypeColor = useCallback((type: string) => {
    const colorMap = {
      domain: "text-blue-500",
      ipv4: "text-green-500",
      ipv6: "text-purple-500",
      asn: "text-orange-500",
      cidr: "text-pink-500",
    } as const;
    return colorMap[type as keyof typeof colorMap] || "text-gray-500";
  }, []);

  const handleRemoveHistory = useCallback(
    (query: string) => {
      if (!mounted) return;

      removeHistory(query);
      setRefreshTrigger((prev) => prev + 1);

      setTimeout(() => {
        const newHistory = listHistory();
        const newTotalPages = Math.ceil(newHistory.length / itemsPerPage);
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(1);
        }
      }, 0);
    },
    [mounted, currentPage, itemsPerPage],
  );

  useEffect(() => {
    if (
      currentPage > paginationData.totalPages &&
      paginationData.totalPages > 0
    ) {
      setCurrentPage(1);
    }
  }, [paginationData.totalPages, currentPage]);

  return (
    <main
      className={
        "w-full min-h-screen grid place-items-center p-4 md:p-6 relative overflow-hidden"
      }
    >
      <div className={"flex flex-col items-center w-full h-fit max-w-[640px]"}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight select-none mb-3 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm md:text-base max-w-sm mx-auto">
            Lightning fast domain & IP lookup availability.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={"w-full relative z-10"}
        >
          <div className="relative group">
            <SearchBox onSearch={handleSearch} loading={loading} autoFocus />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
              <KeyboardShortcut k="/" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full flex flex-row items-center justify-between mt-10 mb-4 px-1"
        >
          <div className="flex flex-row items-center gap-3">
            <div className="relative group">
              <Input
                ref={searchInputRef}
                className="w-24 sm:w-48 lg:w-64 h-8 text-xs pl-8 border-input focus:border-primary/50 transition-all duration-300 bg-background/50 backdrop-blur-sm"
                placeholder={t("search_history")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <RiSearchLine className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground transition-colors duration-300 group-hover:text-foreground" />
            </div>
          </div>

          <div className="flex flex-row gap-2">
            <Popover open={showShortcuts} onOpenChange={setShowShortcuts}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="relative border-input hover:border-primary/50 transition-all duration-300 bg-background/50"
                  title="Keyboard Shortcuts (?)"
                >
                  <RiKeyboardLine className="h-3.5 w-3.5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-0" sideOffset={5}>
                <ShortcutsList />
              </PopoverContent>
            </Popover>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="relative border-input hover:border-primary/50 transition-all duration-300 bg-background/50"
                >
                  <RiFilterLine className="h-3.5 w-3.5" />
                  {selectedType !== "all" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                    />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                  {t("filter_by_type")}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1.5" />
                <DropdownMenuRadioGroup
                  value={selectedType}
                  onValueChange={setSelectedType}
                >
                  <DropdownMenuRadioItem value="all" className="text-xs">
                    {t("all_types")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="domain" className="text-xs">
                    {t("domain_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv4" className="text-xs">
                    {t("ipv4_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="ipv6" className="text-xs">
                    {t("ipv6_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="asn" className="text-xs">
                    {t("asn_only")}
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="cidr" className="text-xs">
                    {t("cidr_only")}
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="relative group border-input hover:border-primary/50 transition-all duration-300 bg-background/50"
            >
              <motion.div
                key={sortOrder}
                initial={{ rotate: 180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {sortOrder === "asc" ? (
                  <RiSortAsc className="h-3.5 w-3.5" />
                ) : (
                  <RiSortDesc className="h-3.5 w-3.5" />
                )}
              </motion.div>
            </Button>

            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setTrashMode(!trashMode)}
              className={cn(
                "relative group border-input hover:border-primary/50 transition-all duration-300 bg-background/50",
                trashMode &&
                  "bg-destructive/5 hover:bg-destructive/10 text-destructive border-destructive",
              )}
            >
              <motion.div
                key={trashMode ? "trash" : "normal"}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Icon
                  icon={trashMode ? <RiArrowGoBackLine /> : <RiDeleteBinLine />}
                  className="w-3.5 h-3.5"
                />
              </motion.div>
            </Button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {paginationData.hasItems ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="w-full"
            >
              <div className="w-full grid grid-cols-1 gap-2.5">
                {paginationData.currentItems.map((item, index) => (
                  <motion.div
                    key={`${item.query}-${item.timestamp}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <Clickable tapScale={0.99}>
                      <Card
                        className={cn(
                          "group transition-all duration-200 border", // Faster transition, solid border
                          "bg-card/40 hover:bg-card/60 backdrop-blur-sm", // More subtle bg change
                          "hover:border-primary/20", // Very subtle border hover
                          trashMode &&
                            "hover:border-destructive hover:bg-destructive/5",
                        )}
                      >
                        <CardContent className="p-3">
                          <Link
                            className="flex flex-row items-center"
                            href={toSearchURI(item.query)}
                            onClick={(e) => {
                              if (trashMode) {
                                e.preventDefault();
                                handleRemoveHistory(item.query);
                                return;
                              } else {
                                handleSearch(item.query);
                              }
                            }}
                          >
                            <div
                              className={cn(
                                "w-9 h-9 rounded-md grid place-items-center border shrink-0 transition-all duration-300",
                                trashMode
                                  ? "border-destructive/30 bg-destructive/5 group-hover:border-destructive"
                                  : `border-border bg-muted/20 group-hover:border-primary/30`,
                              )}
                            >
                              <motion.div
                                key={trashMode ? "trash" : "link"}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                              >
                                <Icon
                                  icon={
                                    !trashMode ? (
                                      <RiGlobalLine />
                                    ) : (
                                      <RiDeleteBinLine />
                                    )
                                  }
                                  className={cn(
                                    "w-4 h-4 transition-colors duration-300",
                                    trashMode
                                      ? "text-destructive"
                                      : getTypeColor(item.queryType),
                                  )}
                                />
                              </motion.div>
                            </div>

                            <div className="ml-3 flex-grow min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold tracking-wide truncate text-foreground">
                                  {item.query}
                                </p>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[9px] px-1.5 py-0 font-medium border uppercase tracking-wider transition-all duration-300",
                                    "group-hover:border-primary/30",
                                  )}
                                >
                                  {item.queryType}
                                </Badge>
                              </div>
                              <div className="flex items-center mt-1 space-x-3 text-[10px] text-muted-foreground font-medium">
                                <div className="flex items-center">
                                  <span>
                                    {format(item.timestamp, "MMM dd, yyyy")}
                                  </span>
                                </div>
                                <div className="w-0.5 h-2 bg-muted-foreground/30" />
                                <span>{format(item.timestamp, "HH:mm")}</span>
                              </div>
                            </div>

                            <motion.div
                              className={cn(
                                "w-7 h-7 rounded-full grid place-items-center ml-2 transition-all duration-300",
                                "opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0", // Reduced visuals
                                "bg-primary/5 text-primary",
                                trashMode &&
                                  "bg-destructive/10 text-destructive",
                              )}
                            >
                              <RiArrowRightSLine className="w-4 h-4" />
                            </motion.div>
                          </Link>
                        </CardContent>
                      </Card>
                    </Clickable>
                  </motion.div>
                ))}
              </div>
              {paginationData.hasPagination && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="mt-6"
                >
                  <Pagination className="justify-center select-none">
                    <PaginationContent className="gap-1 bg-muted/20 p-1 rounded-full border border-border/50 backdrop-blur-sm">
                      <PaginationItem className="hidden sm:inline-block">
                        <PaginationPrevious
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(1, prev - 1))
                          }
                          className={cn(
                            "h-7 min-w-7 px-2 text-xs transition-all duration-300 hover:bg-background rounded-full",
                            currentPage === 1 &&
                              "pointer-events-none opacity-50",
                          )}
                        />
                      </PaginationItem>

                      {(() => {
                        const { totalPages } = paginationData;
                        const maxVisiblePages =
                          typeof window !== "undefined" &&
                          window.innerWidth < 640
                            ? 3
                            : 5;
                        const pages = [];

                        if (totalPages <= maxVisiblePages) {
                          for (let i = 1; i <= totalPages; i++) pages.push(i);
                        } else {
                          if (currentPage <= 3) {
                            for (let i = 1; i <= 3; i++) pages.push(i);
                            pages.push("ellipsis");
                            pages.push(totalPages);
                          } else if (currentPage >= totalPages - 2) {
                            pages.push(1);
                            pages.push("ellipsis");
                            for (let i = totalPages - 2; i <= totalPages; i++)
                              pages.push(i);
                          } else {
                            pages.push(1);
                            pages.push("ellipsis");
                            pages.push(currentPage - 1);
                            pages.push(currentPage);
                            pages.push(currentPage + 1);
                            pages.push("ellipsis");
                            pages.push(totalPages);
                          }
                        }

                        return pages.map((page, index) => (
                          <PaginationItem key={index}>
                            {page === "ellipsis" ? (
                              <PaginationEllipsis className="h-7 min-w-7 text-xs" />
                            ) : (
                              <PaginationLink
                                onClick={() => setCurrentPage(page as number)}
                                isActive={currentPage === page}
                                className={cn(
                                  "h-7 min-w-7 text-xs transition-all duration-300 rounded-full",
                                  currentPage === page &&
                                    "bg-background shadow-sm text-primary font-bold",
                                )}
                              >
                                {page}
                              </PaginationLink>
                            )}
                          </PaginationItem>
                        ));
                      })()}

                      <PaginationItem className="hidden sm:inline-block">
                        <PaginationNext
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(paginationData.totalPages, prev + 1),
                            )
                          }
                          className={cn(
                            "h-7 min-w-7 px-2 text-xs transition-all duration-300 hover:bg-background rounded-full",
                            currentPage === paginationData.totalPages &&
                              "pointer-events-none opacity-50",
                          )}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full mt-12 flex flex-col items-center text-center"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="w-20 h-20 backdrop-blur-sm rounded-full bg-gradient-to-br from-muted/30 to-muted/10 grid place-items-center mb-6 border-2 border-muted/50"
              >
                <RiHistoryLine className="w-10 h-10 text-muted-foreground" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 }}
              >
                <h3 className="text-lg font-medium tracking-wide mb-3 bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                  {t("no_history_title")}
                </h3>
                <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed mb-6">
                  {t("no_history_description")}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                onClick={() => setShowShortcuts(true)}
                className="flex items-center gap-2 text-xs text-muted-foreground border rounded-full px-4 py-2 bg-secondary/25 backdrop-blur-sm hover:bg-secondary/40 transition-all duration-300 cursor-pointer"
              >
                <KeyboardShortcut k="?" />
                <span>Press for shortcuts</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
