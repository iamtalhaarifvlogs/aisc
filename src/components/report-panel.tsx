import { useState } from "react";
import { downloadReport } from "@/lib/agents/pdf";
import { allCrms, readAcross, readTable } from "@/lib/crm/data";
import { DATA_TABLES, tableById } from "@/lib/crm/schema";
import { useAidyl } from "@/lib/store";
import { cellText } from "@/lib/utils";

export function ReportPanel({ lockedSlug }: { lockedSlug?: string }) {
  const operator = useAidyl((s) => s.operatorName);
  const crms = allCrms();
  const [slug, setSlug] = useState(lockedSlug ?? (lockedSlug === undefined ? "all" : "ogamoto"));
  const [tableId, setTableId] = useState("tbl_leads");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const scope = lockedSlug ?? slug;

  async function run(whole: boolean) {
    setBusy(true);
    setMessage("");
    try {
      const ids = whole ? DATA_TABLES.map((t) => t.id) : [tableId];
      const sections = [];
      for (const id of ids) {
        const table = tableById(id);
        if (!table) continue;
        const data =
          scope === "all"
            ? await readAcross(id)
            : (await readTable(scope, id)).map((row) => ({
                crm: scope,
                crmName: crms.find((c) => c.slug === scope)?.name ?? scope,
                row,
              }));
        sections.push({
          heading: table.label,
          columns: ["Company", ...table.fields.slice(0, 6).map((f) => f.label)],
          rows: data.slice(0, 40).map((item) => [item.crmName, ...table.fields.slice(0, 6).map((f) => cellText(item.row[f.key]))]),
        });
      }
      const title = whole ? "Whole business" : tableById(tableId)?.label ?? "Report";
      const company = scope === "all" ? "Aidyl Systems" : crms.find((c) => c.slug === scope)?.name ?? scope;
      await downloadReport({
        title: `${company} · ${title}`,
        subtitle: lockedSlug
          ? "Prepared inside a company desk. Maya-scoped reports never leave Ogamoto."
          : "Prepared from the master desk. Ogamoto is live; other companies are workspace records.",
        preparedBy: operator || "Admin",
        agent: lockedSlug === "ogamoto" ? "Maya" : "Randolph",
        sections,
        notes: "Generated on the desk without a third-party model.",
      });
      setMessage("Download started.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Report failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-xl space-y-4 rounded-xl border border-line bg-surface p-5">
      <h2 className="font-display text-2xl">PDF reports</h2>
      <p className="text-sm text-muted">Randolph can cut a report for one company or the whole group. On Ogamoto, Maya’s report stays on Ogamoto.</p>
      {lockedSlug ? null : (
        <label className="block text-sm">
          Company
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2">
            <option value="all">All companies</option>
            {crms.map((crm) => (
              <option key={crm.slug} value={crm.slug}>
                {crm.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        Section
        <select value={tableId} onChange={(e) => setTableId(e.target.value)} className="mt-1 w-full rounded-md border border-line bg-bg px-3 py-2">
          {DATA_TABLES.map((table) => (
            <option key={table.id} value={table.id}>
              {table.label}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button disabled={busy} onClick={() => run(false)} className="rounded-md bg-brass px-4 py-2 text-sm text-paper disabled:opacity-60">
          {busy ? "Building…" : "Download section"}
        </button>
        <button disabled={busy} onClick={() => run(true)} className="rounded-md bg-ink px-4 py-2 text-sm text-paper disabled:opacity-60">
          Download whole desk
        </button>
      </div>
      {message ? <p className="text-sm">{message}</p> : null}
    </div>
  );
}
