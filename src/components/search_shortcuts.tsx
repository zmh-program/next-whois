import React from "react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function KeyboardShortcut({ k }: { k: string }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[18px] h-4 px-1 text-[9px] font-sans font-medium text-muted-foreground bg-muted/50 border border-border/50 rounded-[3px] mx-0.5 select-none">
      {k}
    </kbd>
  );
}

export function SearchHotkeysText({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground/80",
        className,
      )}
    >
      {[
        { label: t("shortcut_search"), keys: ["/"] },
        { label: t("shortcut_clear"), keys: ["Esc"] },
      ].map((item, i) => (
        <div key={i} className="inline-flex items-center gap-1.5">
          <span>{item.label}</span>
          {item.keys.map((k, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && (
                <span className="text-[9px] text-muted-foreground">+</span>
              )}
              <KeyboardShortcut k={k} />
            </React.Fragment>
          ))}
        </div>
      ))}
    </div>
  );
}
