import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  RiLoader2Line,
  RiSendPlaneLine,
  RiHistoryLine,
  RiLinkM,
} from "@remixicon/react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, isEnter } from "@/lib/utils";
import { listHistory, HistoryItem } from "@/lib/history";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n";

const commonDomains = [
  // Generic TLDs
  ".com",
  ".net",
  ".org",
  ".info",
  ".biz",
  // Tech TLDs
  ".io",
  ".dev",
  ".app",
  ".tech",
  ".ai",
  ".cloud",
  // Country TLDs
  ".cn",
  ".us",
  ".uk",
  ".jp",
  ".de",
  // Personal TLDs
  ".me",
  ".name",
  ".blog",
  // Business TLDs
  ".co",
  ".inc",
  ".ltd",
  ".company",
  // Other Popular TLDs
  ".xyz",
  ".online",
  ".site",
  ".web",
];

// Regex patterns for different query types
const queryPatterns = {
  ipv4: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){0,3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)?$/,
  ipv6: /^(?:[A-F0-9]{1,4}:){0,7}[A-F0-9]{1,4}$/i,
  asn: /^AS\d*$/i,
  cidr: /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/\d{1,2}$/,
  domain: /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z]{2,})*$/,
};

interface SearchBoxProps {
  initialValue?: string;
  onSearch: (value: string) => void;
  loading?: boolean;
  className?: string;
  autoFocus?: boolean;
}

interface SuggestionGroup {
  type: "history" | "quick";
  items: string[];
}

export function SearchBox({
  initialValue = "",
  onSearch,
  loading = false,
  className,
  autoFocus = false,
}: SearchBoxProps) {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SuggestionGroup[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedGroup, setSelectedGroup] = useState(-1);
  const [isEnterPressed, setIsEnterPressed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(listHistory().slice(0, 8));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const predictQueryType = (value: string): string => {
    if (!value) return "domain";

    // Early type prediction based on input patterns
    if (value.match(/^\d{1,3}\./)) return "ipv4";
    if (value.toLowerCase().startsWith("as")) return "asn";
    if (value.includes(":")) return "ipv6";
    if (value.includes("/")) return "cidr";

    // Check against regex patterns
    for (const [type, pattern] of Object.entries(queryPatterns)) {
      if (pattern.test(value)) return type;
    }

    return "domain";
  };

  const generateIPv4Suggestions = (value: string): string[] => {
    const parts = value.split(".");
    const suggestions: string[] = [];

    if (parts.length > 4) return [];

    const lastPart = parts[parts.length - 1];
    const baseIP = parts.slice(0, -1).join(".");

    if (parts.length === 4) {
      // Complete IP address suggestions
      if (lastPart === "" || !isNaN(Number(lastPart))) {
        suggestions.push(`${baseIP}.0`);
        suggestions.push(`${baseIP}.1`);
        suggestions.push(`${baseIP}.254`);
      }
    } else if (parts.length < 4) {
      // Partial IP suggestions
      const commonOctets = ["0", "1", "10", "100", "192", "172", "254"];
      commonOctets.forEach((octet) => {
        if (octet.startsWith(lastPart || "")) {
          suggestions.push(`${baseIP}${baseIP ? "." : ""}${octet}`);
        }
      });
    }

    return suggestions;
  };

  const generateIPv6Suggestions = (value: string): string[] => {
    const parts = value.split(":");
    if (parts.length > 8) return [];

    const suggestions: string[] = [];
    const commonIPv6Parts = ["", "0", "1", "2001", "2002", "fe80", "ff02"];

    if (parts.length <= 8) {
      commonIPv6Parts.forEach((part) => {
        if (part.startsWith(parts[parts.length - 1] || "")) {
          const base = parts.slice(0, -1).join(":");
          suggestions.push(`${base}${base ? ":" : ""}${part}`);
        }
      });
    }

    return suggestions;
  };

  const generateDomainSuggestions = (value: string): string[] => {
    const suggestions: string[] = [];
    const parts = value.split(".");

    if (parts.length === 1 || (parts.length === 2 && parts[1] === "")) {
      // No dot or dot at the end
      commonDomains.forEach((tld) => {
        suggestions.push(parts[0] + tld);
      });
    } else if (parts.length === 2 && parts[1]) {
      // After dot with some input
      commonDomains
        .filter((tld) => tld.substring(1).startsWith(parts[1]))
        .forEach((tld) => {
          suggestions.push(`${parts[0]}${tld}`);
        });
    }

    return suggestions;
  };

  const generateSuggestions = (value: string) => {
    if (!value) return [];

    const type = predictQueryType(value);

    const suggestionGroups: SuggestionGroup[] = [];

    // Add history suggestions first
    const historySuggestions = history
      .filter((item) => item.query.toLowerCase().includes(value.toLowerCase()))
      .map((item) => item.query);

    if (historySuggestions.length > 0) {
      suggestionGroups.push({
        type: "history",
        items: historySuggestions.slice(0, 5),
      });
    }

    // Generate type-specific suggestions
    let typeSuggestions: string[] = [];

    switch (type) {
      case "domain":
        typeSuggestions = generateDomainSuggestions(value);
        break;
      case "ipv4":
        typeSuggestions = generateIPv4Suggestions(value);
        break;
      case "ipv6":
        typeSuggestions = generateIPv6Suggestions(value);
        break;
      case "asn":
        if (value.toLowerCase() === "as") {
          typeSuggestions = [
            "AS2914", // NTT
            "AS7018", // AT&T
            "AS3356", // Level3
            "AS4134", // Chinanet
            "AS9808", // China Mobile
            "AS174", // Cogent
            "AS1299", // Telia
            "AS3257", // GTT
            "AS7922", // Comcast
            "AS209", // CenturyLink
            "AS6939", // Hurricane Electric
            "AS16509", // Amazon
            "AS15169", // Google
            "AS8075", // Microsoft
            "AS13335", // Cloudflare
          ];
        }
        break;
    }

    suggestionGroups.push({
      type: "quick",
      items: typeSuggestions.length > 0 ? typeSuggestions.slice(0, 8) : [value],
    });

    setSuggestions(suggestionGroups);
    return suggestionGroups;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    const newSuggestions = generateSuggestions(value);
    setShowSuggestions(newSuggestions.length > 0);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();

      let currentIndex = selectedIndex;
      let currentGroup = selectedGroup;

      if (e.key === "ArrowDown") {
        if (currentIndex === -1) {
          currentIndex = 0;
          currentGroup = 0;
        } else {
          currentIndex++;
          if (
            currentGroup < suggestions.length &&
            currentIndex >= suggestions[currentGroup].items.length
          ) {
            currentGroup++;
            currentIndex = 0;
          }
        }
      } else {
        if (currentIndex <= 0) {
          if (currentGroup > 0) {
            currentGroup--;
            currentIndex = suggestions[currentGroup].items.length - 1;
          } else {
            currentIndex = -1;
            currentGroup = -1;
          }
        } else {
          currentIndex--;
        }
      }

      setSelectedIndex(currentIndex);
      setSelectedGroup(currentGroup);
    } else if (isEnter(e)) {
      setIsEnterPressed(true);
      setTimeout(() => setIsEnterPressed(false), 200);
      if (
        selectedGroup >= 0 &&
        selectedIndex >= 0 &&
        suggestions[selectedGroup]?.items[selectedIndex]
      ) {
        handleSuggestionClick(suggestions[selectedGroup].items[selectedIndex]);
      } else if (inputValue) {
        handleSearch();
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
    onSearch(suggestion);
  };

  const handleSearch = () => {
    if (inputValue) {
      onSearch(inputValue);
      setShowSuggestions(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative flex flex-row items-center w-full">
        <Input
          ref={inputRef}
          id="main-search-input"
          className="w-full text-left pl-12 pr-12 transition-all duration-300 hover:shadow focus-visible:ring-primary/20 focus-visible:ring-offset-0"
          placeholder={t("search_placeholder")}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
        />
        <Button
          size="icon"
          variant="outline"
          className={cn(
            "absolute right-0 rounded-l-none border-l-0 transition-all duration-300",
            (isEnterPressed || loading) && "bg-primary text-primary-foreground",
            "hover:bg-primary hover:text-primary-foreground",
          )}
          onClick={handleSearch}
        >
          {loading ? (
            <RiLoader2Line className="w-4 h-4 animate-spin" />
          ) : (
            <RiSendPlaneLine className="w-4 h-4" />
          )}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.1 }}
            className="absolute z-50 w-full mt-1 bg-background/95 backdrop-blur-sm rounded-lg border shadow-lg overflow-hidden divide-y divide-border/50"
          >
            {suggestions.map((group, groupIndex) => (
              <div key={group.type} className="relative">
                <div>
                  {group.items.map((suggestion, index) => {
                    const isHistory = group.type === "history";
                    const type = predictQueryType(suggestion);

                    return (
                      <motion.div
                        key={suggestion}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.1 }}
                        className={cn(
                          "flex items-center px-3 py-2 cursor-pointer group",
                          "hover:bg-muted/50 transition-colors duration-150",
                          selectedGroup === groupIndex &&
                            selectedIndex === index &&
                            "bg-muted/50",
                          index !== group.items.length - 1 &&
                            "border-b border-border/10",
                        )}
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {isHistory ? (
                          <RiHistoryLine className="w-3.5 h-3.5 mr-2 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors duration-150" />
                        ) : (
                          <RiLinkM className="w-3.5 h-3.5 mr-2 text-muted-foreground/50 group-hover:text-muted-foreground/70 transition-colors duration-150" />
                        )}
                        <span className="flex-grow text-sm text-foreground/80 group-hover:text-foreground transition-colors duration-150">
                          {suggestion}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "ml-2 text-[10px] px-1.5 py-0 font-normal border-dashed rounded-sm",
                            isHistory
                              ? "opacity-60 bg-muted/20"
                              : "opacity-40 group-hover:opacity-60",
                            "transition-opacity duration-150 bg-primary/20",
                          )}
                        >
                          {type.toUpperCase()}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
