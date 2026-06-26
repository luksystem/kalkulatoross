"use client";

import { useMemo, useState, type ReactNode } from "react";
import { Calculator, CheckCircle2, Home, Sparkles } from "lucide-react";
import { OfferPdfButton } from "@/components/offer-pdf-button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  calculateOffer,
  clampNumber,
  formatCurrency,
  formatPercent,
  isValidEmail,
} from "@/lib/calculations";
import { DEFAULT_PROJECT_METERS, PROJECT_PRICING } from "@/lib/pricing-config";
import type { ClientData, ProjectMeters, ProjectTypeId } from "@/lib/types";

const parseInputNumber = (value: string) => {
  if (!value.trim()) {
    return 0;
  }

  return Number(value.replace(",", "."));
};

const hasInvalidNumber = (value: string) =>
  value.trim() !== "" && Number.isNaN(parseInputNumber(value));

export default function HomePage() {
  const [client, setClient] = useState<ClientData>({
    name: "",
    email: "",
    phone: "",
  });
  const [consent, setConsent] = useState(false);
  const [meterInputs, setMeterInputs] = useState<Record<ProjectTypeId, string>>({
    full: "",
    concept: "",
    technical: "",
  });
  const [discountInput, setDiscountInput] = useState("");

  const meters = useMemo<ProjectMeters>(() => {
    return PROJECT_PRICING.reduce<ProjectMeters>(
      (acc, project) => {
        const parsed = parseInputNumber(meterInputs[project.id]);
        acc[project.id] = clampNumber(parsed, 0, Number.MAX_SAFE_INTEGER);
        return acc;
      },
      { ...DEFAULT_PROJECT_METERS },
    );
  }, [meterInputs]);

  const discountValue = parseInputNumber(discountInput);
  const discountPercent = clampNumber(discountValue, 0, 100);
  const offer = useMemo(
    () => calculateOffer(meters, discountPercent),
    [meters, discountPercent],
  );

  const invalidMeters = PROJECT_PRICING.some((project) => {
    const value = parseInputNumber(meterInputs[project.id]);
    return hasInvalidNumber(meterInputs[project.id]) || value < 0;
  });
  const invalidDiscount =
    hasInvalidNumber(discountInput) || discountValue < 0 || discountValue > 100;
  const validEmail = isValidEmail(client.email);
  const hasRequiredClientData =
    client.name.trim() !== "" && validEmail && client.phone.trim() !== "";
  const isPdfDisabled =
    !hasRequiredClientData ||
    !consent ||
    offer.finalPrice <= 0 ||
    invalidMeters ||
    invalidDiscount;

  const updateClient = (field: keyof ClientData, value: string) => {
    setClient((current) => ({ ...current, [field]: value }));
  };

  const updateMeters = (projectId: ProjectTypeId, value: string) => {
    setMeterInputs((current) => ({ ...current, [projectId]: value }));
  };

  return (
    <main className="min-h-screen px-5 py-8 text-stone-950 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        <header className="flex flex-col gap-6 rounded-[2.5rem] border border-white/70 bg-white/50 p-6 shadow-2xl shadow-stone-900/10 backdrop-blur md:p-10">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-stone-200 bg-white/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-500">
            <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
            Interior offer calculator
          </div>
          <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-4">
              <h1 className="max-w-3xl font-[var(--font-playfair)] text-5xl font-semibold leading-[0.95] tracking-tight text-stone-950 md:text-7xl">
                Wycena projektu wnętrz w kilka chwil.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600 md:text-lg">
                Minimalistyczny kalkulator premium z podglądem ceny, rabatem,
                rozbiciem na raty i gotową ofertą PDF dla klienta.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {PROJECT_PRICING.map((project) => (
                <div
                  key={project.id}
                  className="rounded-3xl border border-stone-200 bg-white/70 p-5 shadow-sm"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {project.shortName}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-950">
                    {formatCurrency(project.ratePerM2)}
                  </p>
                  <p className="text-sm text-stone-500">za m²</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <Card className="p-6 md:p-8">
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-white">
                  <Calculator className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <CardTitle>Kalkulator</CardTitle>
                  <CardDescription>
                    Uzupełnij dane klienta, metraż i opcjonalny rabat.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form className="mt-8 space-y-9">
              <section className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Dane klienta
                  </h3>
                </div>
                <Field label="Imię i nazwisko" htmlFor="name">
                  <Input
                    id="name"
                    placeholder="Anna Kowalska"
                    value={client.name}
                    onChange={(event) => updateClient("name", event.target.value)}
                  />
                </Field>
                <Field label="E-mail" htmlFor="email">
                  <Input
                    id="email"
                    inputMode="email"
                    placeholder="anna@email.pl"
                    value={client.email}
                    onChange={(event) => updateClient("email", event.target.value)}
                  />
                  {client.email && !validEmail ? (
                    <p className="text-xs text-red-600">
                      Podaj poprawny adres e-mail.
                    </p>
                  ) : null}
                </Field>
                <Field label="Telefon" htmlFor="phone">
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="+48 600 000 000"
                    value={client.phone}
                    onChange={(event) => updateClient("phone", event.target.value)}
                  />
                </Field>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                  Zakres projektu
                </h3>
                <div className="grid gap-4">
                  {PROJECT_PRICING.map((project) => {
                    const value = parseInputNumber(meterInputs[project.id]);
                    const isInvalid =
                      hasInvalidNumber(meterInputs[project.id]) || value < 0;

                    return (
                      <div
                        key={project.id}
                        className="grid gap-4 rounded-3xl border border-stone-200 bg-white/55 p-5 md:grid-cols-[1fr_190px]"
                      >
                        <div className="space-y-1">
                          <Label htmlFor={project.id}>{project.name}</Label>
                          <p className="text-sm text-stone-500">
                            Stawka {formatCurrency(project.ratePerM2)} / m²
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Input
                            id={project.id}
                            min={0}
                            inputMode="decimal"
                            placeholder="0"
                            type="number"
                            value={meterInputs[project.id]}
                            onChange={(event) =>
                              updateMeters(project.id, event.target.value)
                            }
                          />
                          {isInvalid ? (
                            <p className="text-xs text-red-600">
                              Metraż nie może być ujemny.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-[1fr_190px] md:items-start">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                    Rabat
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-500">
                    Rabat procentowy jest naliczany proporcjonalnie do każdego
                    wybranego typu projektu.
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    min={0}
                    max={100}
                    inputMode="decimal"
                    placeholder="0"
                    type="number"
                    value={discountInput}
                    onChange={(event) => setDiscountInput(event.target.value)}
                    aria-label="Rabat procentowy"
                  />
                  {invalidDiscount ? (
                    <p className="text-xs text-red-600">
                      Rabat musi być w zakresie od 0 do 100%.
                    </p>
                  ) : null}
                </div>
              </section>

              <label className="flex cursor-pointer gap-3 rounded-3xl border border-stone-200 bg-white/60 p-5 text-sm leading-6 text-stone-600">
                <input
                  className="mt-1 h-5 w-5 rounded border-stone-300 accent-stone-950"
                  checked={consent}
                  type="checkbox"
                  onChange={(event) => setConsent(event.target.checked)}
                />
                <span>
                  Wyrażam zgodę na kontakt w sprawie przygotowanej wyceny oraz
                  przesłanie informacji dotyczących projektu wnętrz.
                </span>
              </label>
            </form>
          </Card>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card className="overflow-hidden">
              <div className="bg-stone-950 p-7 text-white md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-stone-300">Cena po rabacie</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                      {formatCurrency(offer.finalPrice)}
                    </p>
                  </div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10">
                    <Home className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="space-y-7 p-6 md:p-8">
                <div className="grid grid-cols-3 gap-3">
                  <SummaryTile label="Cena bazowa" value={formatCurrency(offer.basePrice)} />
                  <SummaryTile
                    label="Rabat"
                    value={`${formatPercent(offer.discountPercent)}%`}
                  />
                  <SummaryTile
                    label="Oszczędzasz"
                    value={formatCurrency(offer.discountAmount)}
                  />
                </div>

                {offer.selectedProjects.length > 0 ? (
                  <div className="space-y-4">
                    {offer.selectedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="rounded-3xl border border-stone-200 bg-stone-50/80 p-5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-stone-950">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-stone-500">
                            {formatPercent(project.meters)} m² ×{" "}
                              {formatCurrency(project.ratePerM2)} / m²
                            </p>
                          </div>
                          <p className="text-right font-semibold text-stone-950">
                            {formatCurrency(project.finalPrice)}
                          </p>
                        </div>
                        <InstallmentList installments={project.installments} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-stone-300 p-6 text-center text-sm leading-6 text-stone-500">
                    Wpisz metraż w przynajmniej jednym typie projektu, aby
                    zobaczyć wycenę i raty.
                  </div>
                )}

                {offer.selectedProjects.length > 1 ? (
                  <div className="rounded-3xl bg-stone-950 p-5 text-white">
                    <div className="mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
                      <h3 className="font-semibold">Podsumowanie łączne rat</h3>
                    </div>
                    <div className="space-y-3">
                      {offer.totalInstallments.map((installment) => (
                        <div
                          key={installment.label}
                          className="flex items-center justify-between gap-3 text-sm"
                        >
                          <span className="text-stone-300">
                            {installment.label}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(installment.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div className="space-y-3">
                  <OfferPdfButton
                    client={client}
                    disabled={isPdfDisabled}
                    offer={offer}
                  />
                  {isPdfDisabled ? (
                    <p className="text-center text-xs leading-5 text-stone-500">
                      PDF będzie dostępny po uzupełnieniu danych klienta,
                      poprawnego e-maila, zgody i dodatniej ceny końcowej.
                    </p>
                  ) : null}
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
  children,
  htmlFor,
  label,
}: {
  children: ReactNode;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white/60 p-4">
      <p className="text-xs text-stone-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-stone-950 sm:text-base">
        {value}
      </p>
    </div>
  );
}

function InstallmentList({
  installments,
}: {
  installments: Array<{ label: string; percent: number; amount: number }>;
}) {
  return (
    <div className="mt-5 space-y-3">
      {installments.map((installment) => (
        <div
          key={installment.label}
          className="flex items-center justify-between gap-3 text-sm"
        >
          <span className="text-stone-500">
            {installment.label} · {formatPercent(installment.percent)}%
          </span>
          <span className="font-semibold text-stone-900">
            {formatCurrency(installment.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
