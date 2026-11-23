import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  ArrowUpRight,
  BookOpen,
  Github,
  Globe2,
  PanelLeftClose,
  PanelLeftOpen,
  SquarePen,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/navbar";
import { LanguageSwitcher } from "@/components/language-switcher";
import { usePWAInstaller } from "@/components/pwa_installer";
import { listHistory, type HistoryItem } from "@/lib/history";
import { useTranslation } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const railAction =
  "flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm hover:bg-accent focus-visible:outline-ring";
const iconAction =
  "inline-flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground";

export function LookupWorkspace({
  target,
  children,
}: {
  target: string;
  children: ReactNode;
}) {
  const { t, locale } = useTranslation();
  const router = useRouter();
  const { install } = usePWAInstaller();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    const read = () => setHistory(listHistory().slice(0, 30));
    read();
    window.addEventListener("storage", read);
    return () => window.removeEventListener("storage", read);
  }, [router.asPath]);
  const home = (
    <Link
      href="/"
      onClick={() => install(true)}
      className="inline-flex items-center gap-2.5 rounded-md font-semibold tracking-tight"
    >
      <span className="grid size-7 place-items-center rounded-lg bg-foreground text-background">
        <Globe2 aria-hidden className="size-4" />
      </span>
      Next Whois
    </Link>
  );
  const navigation = (
    <>
      <Link href="/" className={railAction}>
        <SquarePen aria-hidden className="size-4" />
        {t("new_search")}
      </Link>
      <h2 className="mb-1 mt-7 px-2.5 text-xs font-medium text-muted-foreground">
        {t("recent_searches")}
      </h2>
      <nav
        aria-label={t("recent_searches")}
        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto"
      >
        {history.length === 0 && (
          <p className="px-2.5 py-2 text-xs text-muted-foreground">
            {t("no_history_title")}
          </p>
        )}
        {history.map(({ query }) => (
          <a
            key={query}
            href={`${locale === router.defaultLocale ? "" : "/" + locale}/${encodeURIComponent(query)}`}
            aria-current={
              query.toLowerCase() === target.toLowerCase() ? "page" : undefined
            }
            className={cn(
              railAction,
              "block min-h-0 truncate py-2 text-[13px] text-muted-foreground aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-foreground",
            )}
          >
            {query}
          </a>
        ))}
      </nav>
      <div className="mt-4 border-t pt-3">
        <Link href="/docs" className={railAction}>
          <BookOpen aria-hidden className="size-4" />
          API
          <ArrowUpRight
            aria-hidden
            className="ml-auto size-3.5 text-muted-foreground"
          />
        </Link>
        <div className="flex items-center gap-3 px-1">
          <ThemeToggle />
          <LanguageSwitcher />
          <a
            href="https://github.com/zmh-program/next-whois"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
            className={iconAction}
          >
            <Github aria-hidden className="size-4" />
          </a>
        </div>
      </div>
    </>
  );
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside
        id="lookup-sidebar"
        aria-label={t("recent_searches")}
        className={cn(
          "sticky top-0 hidden h-screen h-[100dvh] w-56 shrink-0 flex-col border-r bg-muted/35 px-3 py-4 lg:w-60",
          !collapsed && "md:flex",
        )}
      >
        <div className="mb-6 flex items-center justify-between pl-2.5">
          {home}
          <button
            aria-controls="lookup-sidebar"
            aria-expanded="true"
            aria-label={t("workspace.collapse")}
            title={t("workspace.collapse")}
            className={iconAction}
            onClick={() => setCollapsed(true)}
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
        {navigation}
      </aside>
      <div className="min-w-0 flex-1">
        <header
          className={cn(
            "flex h-14 items-center justify-between gap-3 border-b px-4",
            !collapsed && "md:hidden",
          )}
        >
          <div className="flex items-center gap-2">
            <Dialog open={drawer} onOpenChange={setDrawer}>
              <DialogTrigger asChild>
                <button
                  className={cn(iconAction, "md:hidden")}
                  aria-label={t("workspace.expand")}
                >
                  <PanelLeftOpen className="size-4" />
                </button>
              </DialogTrigger>
              <DialogContent
                aria-describedby={undefined}
                className="left-0 top-0 flex h-[100dvh] w-72 max-w-[90vw] translate-x-0 translate-y-0 flex-col gap-0 rounded-none bg-background p-4 data-[state=open]:animate-none data-[state=closed]:animate-none"
              >
                <DialogTitle className="mb-6">{home}</DialogTitle>
                {navigation}
              </DialogContent>
            </Dialog>
            {collapsed && (
              <button
                aria-controls="lookup-sidebar"
                aria-expanded="false"
                aria-label={t("workspace.expand")}
                title={t("workspace.expand")}
                className={cn(iconAction, "hidden md:inline-flex")}
                onClick={() => setCollapsed(false)}
              >
                <PanelLeftOpen className="size-4" />
              </button>
            )}
            {home}
          </div>
          <Link href="/" aria-label={t("new_search")} className={iconAction}>
            <SquarePen className="size-4" />
          </Link>
        </header>
        {children}
      </div>
    </div>
  );
}
