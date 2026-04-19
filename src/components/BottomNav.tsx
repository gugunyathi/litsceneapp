import { Link, useLocation } from "@tanstack/react-router";
import { Home, Map, Radio, Plus, User } from "lucide-react";
import { useFirebase } from "@/lib/FirebaseContext";

type NavItem = {
  to: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
};

const items: NavItem[] = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/map", label: "Map", icon: Map },
  { to: "/post", label: "Post", icon: Plus, primary: true },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/profile", label: "Me", icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const { requireAuth } = useFirebase();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
      <div className="mx-auto flex max-w-md items-end justify-around px-3">
        <div className="glass-dark flex w-full items-center justify-around rounded-full border border-border/40 px-2 py-2 shadow-soft">
          {items.map(({ to, label, icon: Icon, primary }) => {
            const active = pathname === to;
            if (primary) {
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={(e) => {
                    if (!requireAuth()) e.preventDefault();
                  }}
                  className="grid h-12 w-12 place-items-center rounded-full bg-gradient-sunset shadow-glow-coral active:scale-95"
                  aria-label={label}
                >
                  <Icon className="h-6 w-6 text-primary-foreground" strokeWidth={3} />
                </Link>
              );
            }
            return (
              <Link
                key={to}
                to={to}
                className="flex min-w-[3rem] flex-col items-center gap-0.5 px-2 py-1"
                aria-label={label}
              >
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    active ? "text-primary" : "text-foreground/60"
                  }`}
                />
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    active ? "text-primary" : "text-foreground/60"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
