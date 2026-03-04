import { useEffect } from "react";

interface UseSearchHotkeysOptions {
  inputId?: string;
}

export function useSearchHotkeys({
  inputId = "main-search-input",
}: UseSearchHotkeysOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;

      const active = document.activeElement;
      const isInput =
        active instanceof HTMLElement &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable);

      if (e.key === "/" && !isInput && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        document.getElementById(inputId)?.focus();
        return;
      }

      if (e.key === "Escape") {
        const mainInput = document.getElementById(inputId);
        if (active === mainInput) (mainInput as HTMLElement | null)?.blur();
        else if (active instanceof HTMLElement) active.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inputId]);
}
