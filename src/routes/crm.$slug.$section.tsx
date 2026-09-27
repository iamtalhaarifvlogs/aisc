import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Records } from "@/components/records";
import { ReportPanel } from "@/components/report-panel";
import { TrainingPanel } from "@/components/training-panel";
import { listTable } from "@/lib/crm/gateway.functions";
import { isLive } from "@/lib/crm/data";
import { SECTION_TABLE } from "@/lib/crm/schema";
import { useBundle } from "@/lib/crm/use-bundle";
import { useAidyl } from "@/lib/store";
import { cellText } from "@/lib/utils";

export const Route = createFileRoute("/crm/$slug/$section")({ component: SectionPage });

function SectionPage() {
  const { slug, section } = Route.useParams();
  const bundle = useBundle(slug);

  if (section === "activity") return <CompanyActivity slug={slug} />;
  if (section === "reports") {
    return (
      <div>
        {slug !== "ogamoto" ? (
          <p className="mb-4 text-sm text-muted">This report uses the workspace book, not Ogamoto’s live tables.</p>
        ) : null}
        <ReportPanel lockedSlug={slug} />
      </div>
    );
  }
  if (section === "training") {
    return <TrainingPanel defaultAgent={slug === "ogamoto" ? "maya" : "randolph"} crmSlug={slug} />;
  }

  const tableId = SECTION_TABLE[section];
  if (!tableId) {
    return (
      <div>
        <h2 className="font-display text-2xl">That section is not on this desk.</h2>
        <Link to="/crm/$slug" params={{ slug }} className="mt-3 inline-block text-sm text-brass">
          Back to overview
        </Link>
      </div>
    );
  }

  return (
    <Records
      slug={slug}
      tableId={tableId}
      rows={bundle.rows[tableId] ?? []}
      loading={bundle.loading}
      error={bundle.error}
    />
  );
}

function CompanyActivity({ slug }: { slug: string }) {
  const activity = useAidyl((s) => s.activity);
  const local = useMemo(
    () => activity.filter((event) => event.crm === slug),
    [activity, slug],
  );
  const live = isLive(slug);
  const logs = useQuery({
    queryKey: ["crm", "tbl_workflow_logs"],
    queryFn: () => listTable({ data: { table: "tbl_workflow_logs" } }),
    enabled: live,
  });
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section>
        <h2 className="font-display text-2xl">Console</h2>
        <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
          {local.length === 0 ? <li className="px-4 py-6 text-sm text-muted">Nothing logged for this company yet.</li> : null}
          {local.map((event) => (
            <li key={event.id} className="px-4 py-3 text-sm">
              <p>{event.message}</p>
              <p className="text-xs text-muted">
                {new Date(event.at).toLocaleString()} · {event.performedBy}
                {event.agent ? ` via ${event.agent}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </section>
      {live ? (
        <section>
          <h2 className="font-display text-2xl">tbl_workflow_logs</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
            {(logs.data?.items ?? []).map((row, index) => (
              <li key={`${String(row.timestamp)}-${index}`} className="px-4 py-3 text-sm">
                <p>{cellText(row.message || row.action)}</p>
                <p className="text-xs text-muted">
                  {cellText(row.timestamp)} · {cellText(row.performed_by)} · {cellText(row.lead_id)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="rounded-xl border border-line bg-surface p-4 text-sm text-muted">
          Workspace companies keep their log on this console only. Ogamoto is the company that writes tbl_workflow_logs.
        </section>
      )}
    </div>
  );
}
