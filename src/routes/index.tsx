import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { listTable } from "@/lib/crm/gateway.functions";
import { BUILTIN_CRMS, slugify } from "@/lib/crm/registry";
import { useAidyl } from "@/lib/store";
import { asNumber, money } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const custom = useAidyl((s) => s.customCrms);
  const addCrm = useAidyl((s) => s.addCrm);
  const removeCrm = useAidyl((s) => s.removeCrm);
  const leads = useQuery({
    queryKey: ["crm", "tbl_leads"],
    queryFn: () => listTable({ data: { table: "tbl_leads" } }),
  });
  const ships = useQuery({
    queryKey: ["crm", "tbl_shipment"],
    queryFn: () => listTable({ data: { table: "tbl_shipment" } }),
  });
  const [name, setName] = useState("");
  const [focus, setFocus] = useState("");
  const [error, setError] = useState("");

  const pipeline = (leads.data?.items ?? []).reduce((sum, row) => sum + (asNumber(row.budget) ?? 0), 0);
  const companies = [
    ...BUILTIN_CRMS,
    ...custom.map((crm) => ({ ...crm, live: false, agent: "randolph" as const })),
  ];

  function onAdd(e: FormEvent) {
    e.preventDefault();
    const slug = slugify(name);
    if (!slug || !focus.trim()) {
      setError("Name and a one-line focus are required.");
      return;
    }
    if (companies.some((c) => c.slug === slug)) {
      setError("That company already exists.");
      return;
    }
    addCrm({ slug, name: name.trim(), focus: focus.trim() });
    setName("");
    setFocus("");
    setError("");
  }

  return (
    <main>
      <section className="border-b border-line">
        <div className="grid lg:grid-cols-12">
          <div className="px-4 py-8 md:px-8 md:py-12 lg:col-span-7">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Command</p>
            <h1 className="mt-3 max-w-xl font-display text-5xl leading-none md:text-6xl">
              Every company. One desk that talks back.
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              Randolph holds the master book. Maya runs Ogamoto. Aether is the only one who writes a row. Teach them in the studio, or just talk from the bubble.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/training" className="rounded-full bg-ink px-5 py-3 text-sm text-paper">
                Train the agents
              </Link>
              <Link to="/crm/$slug" params={{ slug: "ogamoto" }} className="rounded-full border border-line bg-surface px-5 py-3 text-sm">
                Open Ogamoto
              </Link>
            </div>
          </div>
          <dl className="grid border-t border-line sm:grid-cols-3 lg:col-span-5 lg:border-t-0 lg:border-l">
            <div className="bg-ink px-4 py-5 text-paper">
              <dt className="text-xs text-paper/60">Ogamoto leads</dt>
              <dd className="mt-2 font-display text-4xl tabular-nums">{leads.data ? leads.data.count : "—"}</dd>
            </div>
            <div className="border-line bg-surface px-4 py-5 sm:border-l">
              <dt className="text-xs text-muted">Shipments</dt>
              <dd className="mt-2 font-display text-4xl tabular-nums">{ships.data ? ships.data.count : "—"}</dd>
            </div>
            <div className="border-t border-line bg-brass-soft px-4 py-5 sm:border-t-0 sm:border-l">
              <dt className="text-xs text-brass">Pipeline</dt>
              <dd className="mt-2 font-display text-2xl leading-tight break-words tabular-nums">{leads.data ? money(pipeline) : "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8">
        <div className="grid gap-3 md:grid-cols-3">
          <article className="rounded-3xl bg-ink p-5 text-paper">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Master</p>
            <h2 className="mt-2 font-display text-3xl">Randolph</h2>
            <p className="mt-2 text-sm text-paper/75">Every company, the reports, and the handoff to Maya when a question is really hers.</p>
          </article>
          <article className="rounded-3xl border border-line bg-surface p-5">
            <p className="text-xs tracking-[0.18em] text-forest uppercase">Ogamoto</p>
            <h2 className="mt-2 font-display text-3xl">Maya</h2>
            <p className="mt-2 text-sm text-muted">Buyers, deposits, and sailings. She will not wander into the other companies.</p>
          </article>
          <article className="rounded-3xl bg-brass-soft p-5">
            <p className="text-xs tracking-[0.18em] text-brass uppercase">Writes</p>
            <h2 className="mt-2 font-display text-3xl">Aether</h2>
            <p className="mt-2 text-sm text-ink/80">Creates, updates, deletes, and logs. The others interview you first.</p>
          </article>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <section className="lg:col-span-8">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-display text-2xl">Companies</h2>
              <p className="text-sm text-muted">Open a desk, or add another.</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {companies.map((crm) => (
                <li key={crm.slug} className="flex flex-col justify-between rounded-3xl border border-line bg-surface p-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-2xl">{crm.name}</h3>
                    </div>
                    <p className="mt-1 text-sm text-muted">{crm.focus}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span className={`rounded-full px-2 py-1 ${crm.live ? "bg-forest-soft text-forest" : "bg-brass-soft text-brass"}`}>
                        {crm.live ? "Live Dynamo" : "Workspace"}
                      </span>
                      <span className="rounded-full bg-bg px-2 py-1 text-muted">{crm.agent === "maya" ? "Maya on duty" : "Randolph on duty"}</span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Link to="/crm/$slug" params={{ slug: crm.slug }} className="rounded-full bg-ink px-4 py-2 text-sm text-paper">
                      Open
                    </Link>
                    {BUILTIN_CRMS.every((b) => b.slug !== crm.slug) ? (
                      <button className="rounded-full px-3 py-2 text-sm text-clay" onClick={() => removeCrm(crm.slug)}>
                        Remove
                      </button>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="h-fit rounded-3xl border border-line bg-surface p-5 lg:col-span-4">
            <h2 className="font-display text-2xl">Add a company</h2>
            <p className="mt-1 text-sm text-muted">Same books as the others — leads, freight, finance — kept as a workspace.</p>
            <form onSubmit={onAdd} className="mt-4 space-y-3">
              <label className="block text-sm">
                Name
                <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2" />
              </label>
              <label className="block text-sm">
                Focus
                <textarea value={focus} onChange={(e) => setFocus(e.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-line bg-bg px-3 py-2" />
              </label>
              {error ? <p className="text-sm text-clay">{error}</p> : null}
              <button className="rounded-full bg-brass px-4 py-2 text-sm text-paper">Add company</button>
            </form>
          </section>
        </div>
      </section>
      {leads.error ? (
        <p className="mx-4 mb-6 rounded-md bg-clay-soft px-3 py-2 text-sm text-clay md:mx-8">Ogamoto gateway did not answer. Workspace companies still open.</p>
      ) : null}
    </main>
  );
}
