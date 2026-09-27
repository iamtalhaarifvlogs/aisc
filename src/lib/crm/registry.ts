export type CrmDef = {
  slug: string;
  name: string;
  focus: string;
  live: boolean;
  agent: "maya" | "randolph";
  accent: "brass" | "forest";
};

export const BUILTIN_CRMS: CrmDef[] = [
  {
    slug: "ogamoto",
    name: "Ogamoto",
    focus: "Vehicle export, buyer qualification, finance, and ocean booking.",
    live: true,
    agent: "maya",
    accent: "forest",
  },
  {
    slug: "betterdealtv",
    name: "BetterdealTV",
    focus: "Showroom media, televised inventory, and appointment leads.",
    live: false,
    agent: "randolph",
    accent: "brass",
  },
  {
    slug: "associate-logistics",
    name: "Associate Logistics USA",
    focus: "Inland haulage, yard release, and port delivery inside the US.",
    live: false,
    agent: "randolph",
    accent: "brass",
  },
  {
    slug: "carshipy",
    name: "Carshipy",
    focus: "Booking desk for RoRo and container vehicle allocation.",
    live: false,
    agent: "randolph",
    accent: "brass",
  },
];

export function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 42);
}
