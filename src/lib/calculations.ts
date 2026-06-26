import { PROJECT_PRICING } from "@/lib/pricing-config";
import type { CalculationResult, ProjectMeters } from "@/lib/types";

export const clampNumber = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) {
    return min;
  }

  return Math.min(Math.max(value, min), max);
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPercent = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 2,
  }).format(value);

export const calculateOffer = (
  meters: ProjectMeters,
  discountPercent: number,
): CalculationResult => {
  const safeDiscount = clampNumber(discountPercent, 0, 100);

  const selectedProjects = PROJECT_PRICING.filter(
    (project) => meters[project.id] > 0,
  ).map((project) => {
    const projectBasePrice = meters[project.id] * project.ratePerM2;
    const projectDiscountAmount = projectBasePrice * (safeDiscount / 100);
    const projectFinalPrice = projectBasePrice - projectDiscountAmount;

    return {
      id: project.id,
      name: project.name,
      meters: meters[project.id],
      ratePerM2: project.ratePerM2,
      basePrice: projectBasePrice,
      discountAmount: projectDiscountAmount,
      finalPrice: projectFinalPrice,
      installments: project.installments.map((installment) => ({
        ...installment,
        amount: projectFinalPrice * (installment.percent / 100),
      })),
    };
  });

  const basePrice = selectedProjects.reduce(
    (sum, project) => sum + project.basePrice,
    0,
  );
  const discountAmount = basePrice * (safeDiscount / 100);
  const finalPrice = basePrice - discountAmount;

  const maxInstallmentCount = Math.max(
    0,
    ...selectedProjects.map((project) => project.installments.length),
  );

  const totalInstallments = Array.from(
    { length: maxInstallmentCount },
    (_, index) => ({
      label: `Rata ${index + 1}`,
      amount: selectedProjects.reduce(
        (sum, project) => sum + (project.installments[index]?.amount ?? 0),
        0,
      ),
    }),
  ).filter((installment) => installment.amount > 0);

  return {
    basePrice,
    discountPercent: safeDiscount,
    discountAmount,
    finalPrice,
    selectedProjects,
    totalInstallments,
  };
};

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
