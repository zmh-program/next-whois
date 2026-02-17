"use client";

import * as React from "react";
import { RiSunFill, RiMoonFill, RiSmartphoneFill } from "@remixicon/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { VERSION } from "@/lib/env";
import Link from "next/link";
import { RiGithubFill } from "@remixicon/react";
import { useScrollDirection } from "@/hooks/useScrollDirection";
import { usePWAInstaller } from "./pwa_installer";
import { LanguageSwitcher } from "./language-switcher";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  if (!mounted) {
    return (
      <button>
        <span className="sr-only">Toggle theme</span>
      </button>
    );
  }

  return (
    <motion.button
      className={`p-2 pr-0`}
      onClick={toggleTheme}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ opacity: 0, rotate: -180 }}
          animate={{ opacity: 1, rotate: 0 }}
          exit={{ opacity: 0, rotate: 180 }}
          transition={{ duration: 0.2 }}
        >
          {theme === "light" && <RiSunFill className="h-[1rem] w-[1rem]" />}
          {theme === "dark" && <RiMoonFill className="h-[1rem] w-[1rem]" />}
          {theme === "system" && (
            <RiSmartphoneFill className="h-[1rem] w-[1rem]" />
          )}
        </motion.div>
      </AnimatePresence>
      <span className="sr-only">Toggle theme</span>
    </motion.button>
  );
}

export function Navbar() {
  const isVisible = useScrollDirection();
  const { install } = usePWAInstaller();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center">
      <nav
        className={cn(
          "mt-4 px-2 h-10 rounded-full",
          "bg-background shadow-sm",
          "flex items-center gap-6",
          "transition-all duration-300 ease-in-out",
          "border border-primary/25 border-dashed",
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        )}
      >
        <Link
          href="/"
          className="text-xs ml-2 font-medium tracking-wide hover:text-primary/80 transition-colors flex items-center"
          onClick={() => install(true)}
        >
          NEXT WHOIS
          <p className="text-xs text-muted-foreground ml-1.5">{VERSION}</p>
        </Link>

        <div className="h-4 w-[1px] bg-primary/10" />

        <Link
          href="/docs"
          className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          API
        </Link>

        <div className="h-4 w-[1px] bg-primary/10" />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          <Link
            href="https://github.com/zmh-program/next-whois-ui"
            target="_blank"
            className="inline-flex items-center justify-center rounded-full p-2 hover:scale-110 transition-all duration-300"
          >
            <RiGithubFill className="h-[1rem] w-[1rem]" />
            <span className="sr-only">GitHub</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
