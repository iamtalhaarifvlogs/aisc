import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { listTable } from "@/lib/crm/gateway.functions";
import { useAidyl } from "@/lib/store";
import { cellText } from "@/lib/utils";

export const Route = createFileRoute("/activity")({ component: ActivityPage });

function ActivityPage() {
  const local = useAidyl((s) => s.activity);
  const logs = useQuery({
    queryKey: ["crm", "tbl_workflow_logs"],
    queryFn: () => listTable({ data: { table: "tbl_workflow_logs" } }),
  });
  const remote = [...(logs.data?.items ?? [])].sort((a, b) => String(b.timestamp ?? "").localeCompare(String(a.timestamp ?? "")));

  return (
    <main className="px-4 py-6 md:px-8">
      <h1 className="font-display text-4xl">Activity</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">
        Console actions stay on this desk. Writes against Ogamoto are also pushed to tbl_workflow_logs.
      </p>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl">This console</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {local.length === 0 ? <li className="px-4 py-6 text-sm text-muted">No console actions yet.</li> : null}
            {local.map((event) => (
              <li key={event.id} className="px-4 py-3">
                <p className="text-sm">{event.message}</p>
                <p className="text-xs text-muted">
                  {new Date(event.at).toLocaleString()} · {event.performedBy}
                  {event.agent ? ` · ${event.agent}` : ""} · {event.crm}
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h2 className="font-display text-2xl">Workflow log</h2>
          {logs.isLoading ? <p className="mt-3 text-sm text-muted">Loading tbl_workflow_logs…</p> : null}
          {logs.error ? <p className="mt-3 text-sm text-clay">Could not load the workflow table.</p> : null}
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {remote.length === 0 && !logs.isLoading ? <li className="px-4 py-6 text-sm text-muted">No workflow rows.</li> : null}
            {remote.map((row, index) => (
              <li key={`${String(row.timestamp)}-${index}`} className="px-4 py-3">
                <p className="text-sm">{cellText(row.message || row.action)}</p>
                <p className="text-xs text-muted">
                  {cellText(row.timestamp)} · {cellText(row.performed_by)} · {cellText(row.workflowName)} · lead {cellText(row.lead_id)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
