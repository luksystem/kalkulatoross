export type ProjectTypeId = "full" | "concept" | "technical";

export type ClientData = {
  name: string;
  email: string;
  phone: string;
};

export type ProjectPricing = {
  id: ProjectTypeId;
  name: string;
  shortName: string;
  ratePerM2: number;
  installments: Array<{
    label: string;
    percent: number;
  }>;
};

export type ProjectMeters = Record<ProjectTypeId, number>;

export type ProjectBreakdown = {
  id: ProjectTypeId;
  name: string;
  meters: number;
  ratePerM2: number;
  basePrice: number;
  discountAmount: number;
  finalPrice: number;
  installments: Array<{
    label: string;
    percent: number;
    amount: number;
  }>;
};

export type CalculationResult = {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  selectedProjects: ProjectBreakdown[];
  totalInstallments: Array<{
    label: string;
    amount: number;
  }>;
};
