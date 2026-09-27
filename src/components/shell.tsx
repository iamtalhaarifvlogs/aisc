import { Link, useRouterState } from "@tanstack/react-router";
import { BUILTIN_CRMS } from "@/lib/crm/registry";
import { useAidyl } from "@/lib/store";
import { Menu, X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const MASTER = [
  { to: "/", label: "Command", exact: true },
  { to: "/training", label: "Train agents", exact: false },
  { to: "/activity", label: "Activity", exact: false },
  { to: "/reports", label: "Reports", exact: false },
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navOpen = useAidyl((s) => s.navOpen);
  const setNavOpen = useAidyl((s) => s.setNavOpen);
  const operator = useAidyl((s) => s.operatorName);
  const setOperator = useAidyl((s) => s.setOperatorName);
  const custom = useAidyl((s) => s.customCrms);
  const crms = [
    ...BUILTIN_CRMS,
    ...custom.map((crm) => ({ ...crm, live: false })),
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      {navOpen ? (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col bg-ink text-paper md:flex",
          navOpen ? "flex" : "hidden",
        )}
      >
        <div className="flex items-center gap-3 px-5 py-5">
          <span className="grid size-10 place-items-center rounded-md bg-brass font-display text-lg text-paper">AS</span>
          <div>
            <p className="font-display text-lg leading-none">Aidyl</p>
            <p className="text-xs text-paper/70">Systems desk</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4">
          <div>
            <p className="px-2 pb-2 text-xs tracking-wide text-paper/50">Master</p>
            <ul className="space-y-1">
              {MASTER.map((item) => {
                const on = item.exact ? path === item.to : path.startsWith(item.to);
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2 text-sm",
                        on ? "bg-paper/15 text-paper" : "text-paper/75 hover:bg-paper/10 hover:text-paper",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <p className="px-2 pb-2 text-xs tracking-wide text-paper/50">Companies</p>
            <ul className="space-y-1">
              {crms.map((crm) => {
                const on = path.startsWith(`/crm/${crm.slug}`);
                return (
                  <li key={crm.slug}>
                    <Link
                      to="/crm/$slug"
                      params={{ slug: crm.slug }}
                      onClick={() => setNavOpen(false)}
                      className={cn(
                        "block rounded-md px-3 py-2",
                        on ? "bg-paper/15" : "hover:bg-paper/10",
                      )}
                    >
                      <span className="block text-sm text-paper">{crm.name}</span>
                      <span className="block text-xs text-paper/55">{crm.live ? "Live Dynamo" : "Workspace"}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
        <label className="border-t border-paper/15 px-4 py-4 text-xs text-paper/70">
          Signing as
          <input
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="mt-1 w-full rounded-md border border-paper/20 bg-ink px-2 py-2 text-sm text-paper"
          />
        </label>
      </aside>
      <div className="md:pl-64">
        <div className="sticky top-0 z-20 flex items-center gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur md:hidden">
          <button
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="grid size-11 place-items-center rounded-md border border-line bg-surface"
            onClick={() => setNavOpen(!navOpen)}
          >
            {navOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-display text-lg">Aidyl</span>
          <Link to="/training" onClick={() => setNavOpen(false)} className="ml-auto rounded-full bg-brass px-3 py-2 text-sm text-paper">
            Train agents
          </Link>
        </div>
        <div className="pb-24">{children}</div>
      </div>
    </div>
  );
}
