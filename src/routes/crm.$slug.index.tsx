import { createFileRoute } from "@tanstack/react-router";
import { Analytics } from "@/components/analytics";
import { useBundle } from "@/lib/crm/use-bundle";

export const Route = createFileRoute("/crm/$slug/")({ component: Overview });

function Overview() {
  const { slug } = Route.useParams();
  const bundle = useBundle(slug);
  return (
    <div className="space-y-4">
      {!bundle.live ? (
        <p className="rounded-xl border border-line bg-brass-soft px-4 py-3 text-sm">
          These rows live in this browser workspace. They are not written to the Ogamoto tables. Randolph can still report on them.
        </p>
      ) : (
        <p className="text-sm text-muted">Ogamoto is reading and writing the live gateway. Every save is logged.</p>
      )}
      {bundle.error ? <p className="rounded-md bg-clay-soft px-3 py-2 text-sm text-clay">{bundle.error}</p> : null}
      <Analytics
        leads={bundle.rows.tbl_leads ?? []}
        shipments={bundle.rows.tbl_shipment ?? []}
        financing={bundle.rows.tbl_financing ?? []}
        logistics={bundle.rows.tbl_logistics ?? []}
      />
    </div>
  );
}
