import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/", label: "Beranda", icon: "fa-solid fa-house" },
  { to: "/ongoing", label: "Ongoing", icon: "fa-solid fa-tower-broadcast", search: { page: 1 } },
  { to: "/tamat", label: "Tamat", icon: "fa-solid fa-circle-check", search: { page: 1 } },
  { to: "/genre", label: "Genre", icon: "fa-solid fa-tags" },
  { to: "/jadwal", label: "Jadwal", icon: "fa-solid fa-calendar-days" },
  { to: "/riwayat", label: "Riwayat", icon: "fa-solid fa-clock-rotate-left" },
] as const;

export function SiteHeader() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [open, setOpen] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const q = term.trim();
    if (!q) return;
    navigate({ to: "/cari", search: { q } });
    setOpen(false);
  }

  return (
    <>
      {open ? (
        <div onClick={() => setOpen(false)} aria-hidden="true" className="fixed inset-0 z-30 lg:hidden" />
      ) : null}
      <header className="sticky top-0 z-40 border-b-2 border-foreground bg-background shadow-brutal-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
          <img src="/logo.svg" alt="Nontonime" className="h-7 w-7 rounded-md" />
          Nontonime
        </Link>

        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              search={("search" in item ? item.search : {}) as never}
              activeProps={{ className: "border-2 border-foreground bg-primary text-primary-foreground shadow-brutal-sm" }}
              className="border-2 border-transparent px-3 py-2 text-sm font-bold text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={submit} className="ml-auto hidden items-center md:flex">
          <div className="relative">
            <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Cari anime"
              className="h-9 w-56 border-2 border-foreground bg-card pl-9 pr-3 text-sm text-card-foreground outline-none transition-colors placeholder:text-muted-foreground focus:bg-accent"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:ml-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen((value) => !value)}
            aria-label="Menu"
            className="shadow-brutal-press inline-flex h-9 w-9 items-center justify-center border-2 border-foreground bg-card text-card-foreground shadow-brutal-sm lg:hidden"
          >
            <i className={open ? "fa-solid fa-xmark" : "fa-solid fa-bars"} />
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t-2 border-foreground bg-background px-4 py-3 lg:hidden">
          <form onSubmit={submit} className="mb-3 md:hidden">
            <div className="relative">
              <i className="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground" />
              <input
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                placeholder="Cari anime"
                className="h-10 w-full border-2 border-foreground bg-card pl-9 pr-3 text-sm text-card-foreground outline-none placeholder:text-muted-foreground focus:bg-accent"
              />
            </div>
          </form>
          <div className="grid grid-cols-2 gap-2">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                search={("search" in item ? item.search : {}) as never}
                onClick={() => setOpen(false)}
                className="shadow-brutal-press flex items-center gap-2 border-2 border-foreground bg-card px-3 py-2 text-sm font-bold text-card-foreground shadow-brutal-sm"
              >
                <i className={`${item.icon} text-primary`} />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
      </header>
    </>
  );
}
