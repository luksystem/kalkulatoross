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
    <main className="relative min-h-screen overflow-hidden px-4 pb-8 pt-24 text-stone-50 sm:px-8 lg:px-10 lg:pt-10">
      <div className="pointer-events-none absolute left-[-10rem] top-28 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl" />
      <div className="pointer-events-none absolute right-[-12rem] top-10 h-96 w-96 rounded-full bg-emerald-500/15 blur-3xl" />

      <div className="fixed inset-x-3 top-3 z-50 rounded-[1.6rem] border border-white/10 bg-zinc-950/[0.92] p-3 text-white shadow-[0_20px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-300">
              Cena końcowa
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight">
              {formatCurrency(offer.finalPrice)}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-2 text-right">
            <p className="text-[11px] text-stone-300">Zakresy</p>
            <p className="text-sm font-semibold">
              {offer.selectedProjects.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col gap-8">
        <header className="relative overflow-hidden rounded-[2.8rem] border border-white/10 bg-zinc-950/[0.72] p-6 shadow-[0_35px_110px_rgba(0,0,0,0.48)] backdrop-blur-xl md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full bg-amber-500/18 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-10 h-36 w-36 rounded-full bg-emerald-400/10 blur-2xl" />
          <div className="relative inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/20 bg-white/[0.06] px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-amber-100 shadow-lg shadow-black/20">
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Interior offer calculator
          </div>
          <div className="relative mt-6 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
            <div className="space-y-4">
              <h1 className="max-w-3xl font-[var(--font-playfair)] text-5xl font-semibold leading-[0.95] tracking-tight text-stone-50 md:text-7xl">
                Wycena projektu wnętrz w kilka chwil.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-stone-300 md:text-lg">
                Minimalistyczny kalkulator premium z podglądem ceny, rabatem,
                rozbiciem na raty i gotową ofertą PDF dla klienta.
              </p>
              <div className="flex flex-wrap gap-3 pt-2 text-sm text-stone-300">
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-sm">
                  PDF po stronie klienta
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-sm">
                  Live pricing
                </span>
                <span className="rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 shadow-sm">
                  Responsywny UX
                </span>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {PROJECT_PRICING.map((project) => (
                <div
                  key={project.id}
                  className="group rounded-[1.8rem] border border-white/10 bg-white/[0.06] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.22)] transition duration-200 hover:-translate-y-1 hover:border-amber-200/30 hover:bg-white/[0.09]"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {project.shortName}
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-stone-50">
                    {formatCurrency(project.ratePerM2)}
                  </p>
                  <p className="text-sm text-stone-400">za m²</p>
                </div>
              ))}
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
          <Card className="relative overflow-hidden p-6 md:p-8">
            <div className="pointer-events-none absolute right-8 top-8 h-40 w-40 rounded-full bg-amber-400/10 blur-3xl" />
            <CardHeader>
              <div className="relative flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-300 to-emerald-700 text-zinc-950 shadow-lg shadow-amber-900/20">
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

            <form className="relative mt-8 space-y-9">
              <section className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2 md:col-span-3">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">
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
                    <p className="text-xs text-red-300">
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
                        className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.24)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-200/25 hover:bg-white/[0.08] md:grid-cols-[1fr_190px]"
                      >
                        <div className="space-y-1">
                          <Label htmlFor={project.id}>{project.name}</Label>
                          <p className="text-sm text-stone-400">
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
                            <p className="text-xs text-red-300">
                              Metraż nie może być ujemny.
                            </p>
                          ) : null}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              <section className="grid gap-4 rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-emerald-400/[0.08] p-5 shadow-[0_14px_35px_rgba(0,0,0,0.24)] md:grid-cols-[1fr_190px] md:items-start">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100/70">
                    Rabat
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
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
                    <p className="text-xs text-red-300">
                      Rabat musi być w zakresie od 0 do 100%.
                    </p>
                  ) : null}
                </div>
              </section>

              <label className="flex cursor-pointer gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.05] p-5 text-sm leading-6 text-stone-300 shadow-[0_14px_35px_rgba(0,0,0,0.24)] transition hover:border-amber-200/25 hover:bg-white/[0.08]">
                <input
                  className="mt-1 h-5 w-5 rounded border-stone-600 accent-amber-300"
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
            <Card className="overflow-hidden border-stone-950/10">
              <div className="relative overflow-hidden bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950 p-7 text-white md:p-8">
                <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                <div className="flex items-center justify-between gap-4">
                  <div className="relative">
                    <p className="text-sm text-stone-300">Cena po rabacie</p>
                    <p className="mt-2 text-4xl font-semibold tracking-tight">
                      {formatCurrency(offer.finalPrice)}
                    </p>
                  </div>
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-3xl bg-white/10 shadow-inner shadow-white/10">
                    <Home className="h-6 w-6" aria-hidden="true" />
                  </span>
                </div>
              </div>

              <div className="space-y-7 bg-zinc-950/[0.62] p-6 md:p-8">
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
                        className="rounded-[1.8rem] border border-white/10 bg-gradient-to-br from-white/[0.07] to-emerald-400/[0.06] p-5 shadow-[0_16px_38px_rgba(0,0,0,0.3)]"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-stone-50">
                              {project.name}
                            </h3>
                            <p className="mt-1 text-sm text-stone-400">
                            {formatPercent(project.meters)} m² ×{" "}
                              {formatCurrency(project.ratePerM2)} / m²
                            </p>
                          </div>
                          <p className="text-right font-semibold text-amber-100">
                            {formatCurrency(project.finalPrice)}
                          </p>
                        </div>
                        <InstallmentList installments={project.installments} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-dashed border-white/15 p-6 text-center text-sm leading-6 text-stone-400">
                    Wpisz metraż w przynajmniej jednym typie projektu, aby
                    zobaczyć wycenę i raty.
                  </div>
                )}

                {offer.selectedProjects.length > 1 ? (
                  <div className="rounded-[1.8rem] border border-amber-200/10 bg-gradient-to-br from-zinc-950 to-emerald-950 p-5 text-white shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
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
                    <p className="text-center text-xs leading-5 text-stone-400">
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
    <div className="rounded-[1.55rem] border border-white/10 bg-white/[0.06] p-4 shadow-[0_12px_28px_rgba(0,0,0,0.24)]">
      <p className="text-xs text-stone-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-stone-50 sm:text-base">
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
          className="flex items-center justify-between gap-3 rounded-2xl bg-white/[0.06] px-3 py-2 text-sm"
        >
          <span className="text-stone-400">
            {installment.label} · {formatPercent(installment.percent)}%
          </span>
          <span className="font-semibold text-amber-100">
            {formatCurrency(installment.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}
