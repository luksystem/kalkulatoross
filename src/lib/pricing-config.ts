import type { ProjectPricing } from "@/lib/types";

export const PROJECT_PRICING: ProjectPricing[] = [
  {
    id: "full",
    name: "Projekt pełny",
    shortName: "Pełny",
    ratePerM2: 390,
    installments: [
      { label: "Rata 1", percent: 10 },
      { label: "Rata 2", percent: 16 },
      { label: "Rata 3", percent: 19 },
      { label: "Rata 4A", percent: 19 },
      { label: "Rata 4B", percent: 9 },
      { label: "Rata 5", percent: 27 },
    ],
  },
  {
    id: "concept",
    name: "Projekt koncepcyjny",
    shortName: "Koncepcyjny",
    ratePerM2: 230,
    installments: [
      { label: "Rata 1", percent: 15 },
      { label: "Rata 2", percent: 25 },
      { label: "Rata 3", percent: 29 },
      { label: "Rata 4", percent: 31 },
    ],
  },
  {
    id: "technical",
    name: "Projekt techniczny",
    shortName: "Techniczny",
    ratePerM2: 120,
    installments: [
      { label: "Rata 1", percent: 20 },
      { label: "Rata 2", percent: 39 },
      { label: "Rata 3", percent: 41 },
    ],
  },
];

export const DEFAULT_PROJECT_METERS = {
  full: 0,
  concept: 0,
  technical: 0,
} as const;
