import { Link } from "@tanstack/react-router";

const TABS = [
  { to: "/", label: "Home", icon: "fa-solid fa-house", exact: true },
  { to: "/jadwal", label: "Jadwal", icon: "fa-solid fa-calendar-days", exact: false },
  { to: "/riwayat", label: "History", icon: "fa-solid fa-clock-rotate-left", exact: false },
  { to: "/download", label: "Download", icon: "fa-solid fa-download", exact: false },
  { to: "/profil", label: "Profil", icon: "fa-solid fa-circle-user", exact: false },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t-2 border-foreground bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      {TABS.map((tab) => (
        <Link
          key={tab.to}
          to={tab.to}
          activeOptions={{ exact: tab.exact }}
          activeProps={{ className: "bg-primary text-primary-foreground" }}
          className="flex flex-1 flex-col items-center gap-1 border-r-2 border-foreground py-2 text-[11px] font-bold text-muted-foreground transition-colors last:border-r-0"
        >
          <i className={`${tab.icon} text-lg`} />
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
