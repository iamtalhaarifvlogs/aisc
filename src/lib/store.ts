import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Row } from "@/lib/crm/schema";
import { uid, nowIso } from "@/lib/utils";

export type TrainingDoc = {
  id: string;
  lead_id: string;
  context_type: string;
  agent: "randolph" | "maya" | "both";
  title: string;
  body: string;
  createdAt: string;
};

export type ActivityEvent = {
  id: string;
  at: string;
  crm: string;
  table?: string;
  action: string;
  message: string;
  performedBy: string;
  status: "success" | "error";
  agent?: string;
};

export type Specialist = {
  id: string;
  name: string;
  crmSlug: string;
  brief: string;
  createdAt: string;
};

export type CustomCrm = {
  slug: string;
  name: string;
  focus: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "agent" | "aether" | "peer";
  agent?: string;
  text: string;
  at: string;
};

export type PendingTask = {
  kind: "create" | "update" | "delete";
  table: string;
  crm: string;
  values: Record<string, string>;
  asking?: string;
  phase: "collect" | "optional" | "confirm";
  key?: Record<string, string>;
  matches?: { id: string; label: string }[];
};

export type Mind = { pending?: PendingTask };

type Workspace = Record<string, Row[]>;

type AidylState = {
  operatorName: string;
  customCrms: CustomCrm[];
  specialists: Specialist[];
  workspaces: Record<string, Workspace>;
  activity: ActivityEvent[];
  training: TrainingDoc[];
  threads: Record<string, ChatMessage[]>;
  minds: Record<string, Mind>;
  navOpen: boolean;
  setOperatorName: (name: string) => void;
  setNavOpen: (open: boolean) => void;
  addCrm: (crm: CustomCrm) => void;
  removeCrm: (slug: string) => void;
  addSpecialist: (s: Specialist) => void;
  removeSpecialist: (id: string) => void;
  ensureWorkspace: (slug: string) => Workspace;
  setRows: (slug: string, table: string, rows: Row[]) => void;
  pushActivity: (event: ActivityEvent) => void;
  upsertTraining: (doc: TrainingDoc) => void;
  removeTraining: (id: string) => void;
  replaceTraining: (docs: TrainingDoc[]) => void;
  pushMessage: (thread: string, message: ChatMessage) => void;
  setMind: (thread: string, mind: Mind) => void;
  clearThread: (thread: string) => void;
};

const memoryStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

function seedWorkspace(slug: string): Workspace {
  if (slug === "betterdealtv") {
    return {
      tbl_leads: [
        {
          lead_id: "bd-lead-104",
          name: "Elena Vasquez",
          email: "elena@northbaymotors.example",
          phone: "+1 415 555 0144",
          location: "Oakland, USA",
          preferredVehicle: "2022 Toyota Highlander",
          budget: 28000,
          downPayment: 4000,
          creditStatus: "good",
          stage: "showroom",
          statuses: ["appointment"],
          timeline: "This month",
          assignedRep: "Studio A",
          createdAt: "2026-08-02T15:00:00.000Z",
          lastActivity: "2026-08-12T15:00:00.000Z",
        },
        {
          lead_id: "bd-lead-118",
          name: "Marcus Hale",
          email: "marcus.hale@example.com",
          phone: "+1 702 555 0190",
          location: "Las Vegas, USA",
          preferredVehicle: "Ford F-150 XLT",
          budget: 41000,
          downPayment: 6000,
          creditStatus: "excellent",
          stage: "quote",
          statuses: ["hot"],
          timeline: "2 weeks",
          assignedRep: "Studio B",
          createdAt: "2026-07-18T18:10:00.000Z",
          lastActivity: "2026-08-01T18:10:00.000Z",
        },
      ],
      tbl_calls: [
        {
          call_id: "bd-call-1",
          Caller: "Elena Vasquez",
          lead_id: "bd-lead-104",
          direction: "Inbound",
          outcome: "Booked Saturday walkaround",
          notes: "Wants the Highlander featured on Thursday's slot.",
          timestamp: "2026-08-11T20:00:00.000Z",
        },
      ],
      tbl_financing: [],
      tbl_logistics: [],
      tbl_ports: [],
      tbl_shipment: [],
      tbl_workflow_logs: [],
    };
  }
  if (slug === "associate-logistics") {
    return {
      tbl_ports: [
        {
          port_id: "al-port-1",
          port_name: "Port of Savannah",
          port_code: "SAV",
          city: "Savannah",
          state: "Georgia",
          country: "United States",
          container_supported: "Yes",
          roro_supported: "Yes",
          shipping_partner: "Aidyl haulage",
          active_status: "Active",
          supported_destination_countries: "Nigeria, Ghana, Liberia",
        },
      ],
      tbl_logistics: [
        {
          logistics_id: "al-log-1",
          logistics_status: "Quoted",
          origin_note: "Atlanta yard to Savannah",
          inland_transport_cost: 980,
          ocean_freight_cost: 0,
          clearance_cost: 0,
          insurance_cost: 140,
          other_fees: 75,
          total_logistics_cost: 1195,
          estimated_transit_time: "2 days inland",
          last_updated: "2026-08-20T12:00:00.000Z",
          lead_id: "yard-44",
        },
      ],
      tbl_leads: [],
      tbl_financing: [],
      tbl_shipment: [],
      tbl_calls: [],
      tbl_workflow_logs: [],
    };
  }
  if (slug === "carshipy") {
    return {
      tbl_shipment: [
        {
          shipment_id: "cs-ship-1",
          shipment_number: "RORO-4419",
          lead_id: "cs-lead-2",
          vehicle_id: "veh-cs-2",
          shipment_status: "Booked",
          origin_location: "Baltimore, MD",
          destination_country: "Ghana",
          port_used: "Port of Baltimore",
          actual_port_used: "Port of Baltimore",
          shipping_line: "Grimaldi",
          vessel_name: "Grande Nigeria",
          departure_date: "2026-09-04",
          arrival_date: "2026-10-02",
          estimated_transit_time: "26-30 days",
          ocean_freight_cost: 2100,
          inland_transport_cost: 640,
          total_logistics_cost: 2740,
        },
      ],
      tbl_leads: [
        {
          lead_id: "cs-lead-2",
          name: "Kojo Mensah",
          email: "kojo@example.com",
          phone: "+233 20 555 0188",
          location: "Tema, Ghana",
          preferredVehicle: "Honda CR-V",
          budget: 19000,
          stage: "booked",
          statuses: ["confirmed"],
          creditStatus: "good",
          timeline: "Sailing September",
          assignedRep: "Carshipy desk",
          createdAt: "2026-07-02T11:00:00.000Z",
          lastActivity: "2026-08-28T11:00:00.000Z",
          downPayment: 3500,
        },
      ],
      tbl_financing: [],
      tbl_logistics: [],
      tbl_ports: [],
      tbl_calls: [],
      tbl_workflow_logs: [],
    };
  }
  return {
    tbl_leads: [],
    tbl_financing: [],
    tbl_logistics: [],
    tbl_ports: [],
    tbl_shipment: [],
    tbl_calls: [],
    tbl_workflow_logs: [],
  };
}

export const useAidyl = create<AidylState>()(
  persist(
    (set, get) => ({
      operatorName: "Admin",
      customCrms: [],
      specialists: [],
      workspaces: {
        betterdealtv: seedWorkspace("betterdealtv"),
        "associate-logistics": seedWorkspace("associate-logistics"),
        carshipy: seedWorkspace("carshipy"),
      },
      activity: [],
      training: [
        {
          id: "seed-maya-roro",
          lead_id: "agent-maya",
          context_type: "train-seed-roro",
          agent: "maya",
          title: "West Africa routing",
          body: "Ogamoto prefers RoRo out of Savannah or Baltimore for trucks and SUVs bound for Nigeria and Ghana. Container is for overflow and sedans when RoRo space is tight. Always attach a lead before a shipment is written.",
          createdAt: "2026-06-01T00:00:00.000Z",
        },
        {
          id: "seed-randolph-desk",
          lead_id: "agent-randolph",
          context_type: "train-seed-desk",
          agent: "randolph",
          title: "How the companies split",
          body: "Ogamoto owns the export buyer and the Dynamo tables. BetterdealTV is showroom media. Associate Logistics USA is inland US haulage. Carshipy is the booking desk. Randolph can see every company. Maya stays on Ogamoto. Aether is the only one who writes rows.",
          createdAt: "2026-06-01T00:00:00.000Z",
        },
      ],
      threads: {},
      minds: {},
      navOpen: false,
      setOperatorName: (operatorName) => set({ operatorName }),
      setNavOpen: (navOpen) => set({ navOpen }),
      addCrm: (crm) =>
        set((s) => ({
          customCrms: [...s.customCrms, crm],
          workspaces: { ...s.workspaces, [crm.slug]: seedWorkspace(crm.slug) },
        })),
      removeCrm: (slug) =>
        set((s) => {
          const workspaces = { ...s.workspaces };
          delete workspaces[slug];
          return {
            customCrms: s.customCrms.filter((c) => c.slug !== slug),
            specialists: s.specialists.filter((sp) => sp.crmSlug !== slug),
            workspaces,
          };
        }),
      addSpecialist: (specialist) => set((s) => ({ specialists: [...s.specialists, specialist] })),
      removeSpecialist: (id) => set((s) => ({ specialists: s.specialists.filter((sp) => sp.id !== id) })),
      ensureWorkspace: (slug) => {
        const existing = get().workspaces[slug];
        if (existing) return existing;
        const seeded = seedWorkspace(slug);
        set((s) => ({ workspaces: { ...s.workspaces, [slug]: seeded } }));
        return seeded;
      },
      setRows: (slug, table, rows) =>
        set((s) => ({
          workspaces: {
            ...s.workspaces,
            [slug]: { ...(s.workspaces[slug] ?? seedWorkspace(slug)), [table]: rows },
          },
        })),
      pushActivity: (event) => set((s) => ({ activity: [event, ...s.activity].slice(0, 400) })),
      upsertTraining: (doc) =>
        set((s) => ({
          training: [doc, ...s.training.filter((t) => t.id !== doc.id)].slice(0, 200),
        })),
      removeTraining: (id) => set((s) => ({ training: s.training.filter((t) => t.id !== id) })),
      replaceTraining: (docs) => set({ training: docs }),
      pushMessage: (thread, message) =>
        set((s) => ({
          threads: {
            ...s.threads,
            [thread]: [...(s.threads[thread] ?? []), message].slice(-80),
          },
        })),
      setMind: (thread, mind) => set((s) => ({ minds: { ...s.minds, [thread]: mind } })),
      clearThread: (thread) =>
        set((s) => ({
          threads: { ...s.threads, [thread]: [] },
          minds: { ...s.minds, [thread]: {} },
        })),
    }),
    {
      name: "aidyl-systems",
      skipHydration: true,
      storage: createJSONStorage(() => (typeof window === "undefined" ? memoryStorage : localStorage)),
      partialize: (s) => ({
        operatorName: s.operatorName,
        customCrms: s.customCrms,
        specialists: s.specialists,
        workspaces: s.workspaces,
        activity: s.activity,
        training: s.training,
        threads: s.threads,
        minds: s.minds,
      }),
    },
  ),
);

export function blankActivity(partial: Omit<ActivityEvent, "id" | "at">): ActivityEvent {
  return { ...partial, id: uid("act"), at: nowIso() };
}
