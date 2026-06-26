"use client";

import Image from "next/image";
import { useMemo, useState, type ReactNode } from "react";
import { Calculator, CheckCircle2, Home } from "lucide-react";
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

const getDiscountPercentFromCode = (code: string) => {
  const normalizedCode = code.trim().toLowerCase();

  if (!normalizedCode) {
    return 0;
  }

  const match = /^rabat(\d{1,3})$/.exec(normalizedCode);

  if (!match) {
    return 0;
  }

  return clampNumber(Number(match[1]), 0, 100);
};

const isValidDiscountCode = (code: string) => {
  const normalizedCode = code.trim().toLowerCase();

  if (!normalizedCode) {
    return true;
  }

  const match = /^rabat(\d{1,3})$/.exec(normalizedCode);

  return Boolean(match && Number(match[1]) <= 100);
};

const PROJECT_DESCRIPTIONS = [
  {
    title: "Projekt TECHNICZNY",
    price: "120 zł / 1 m²",
    description:
      "To projekt bez wizualizacji, stanowiący bazę dla wszystkich innych opracowań. Skupia się na kluczowych informacjach technicznych i instalacyjnych: układzie funkcjonalnym oraz instalacjach. Idealny, gdy wizualizacje są odłożone w czasie lub nie są planowane. Można go rozwijać do kolejnych pakietów. Obejmuje 3 spotkania w studio.",
  },
  {
    title: "Projekt KONCEPCYJNY",
    price: "230 zł / 1 m² + zakres techniczny",
    description:
      "Idealny, gdy masz jasną wizję lub szukasz rozwiązania do inwestycji, na przykład mieszkania na wynajem. Zawiera jeden komplet wizualizacji bez korekt, dobór materiałów w formie notatki oraz łącznie 4 spotkania. Wymaga precyzyjnych wytycznych i inspiracji od klienta. Każdy projekt koncepcyjny można rozszerzyć do pełnego.",
  },
  {
    title: "Projekt PEŁNY",
    price: "390 zł / 1 m² + zakres techniczny",
    description:
      "Kompleksowe i najbardziej spersonalizowane rozwiązanie. Oferuje wizualizacje z dwiema korektami, wyczerpujące rysunki wykonawcze mebli i ścian, opisy ułatwiające wycenę oraz łącznie 7 spotkań. To najlepszy wybór, gdy wnętrze ma być unikalne, dopracowane i w pełni zindywidualizowane.",
  },
];

const WORKFLOW_STAGES = [
  {
    title: "ETAP 1: Pierwszy kontakt i oferta",
    items: [
      "Spotkanie prezentujące ofertę.",
      "Omówienie przebiegu i zakresu pracy.",
      "Wypełnienie ankiety klienta, akceptacja oferty i umowy.",
      "Rozliczenie pierwszej raty projektu.",
    ],
  },
  {
    title: "ETAP 2: Układ Funkcjonalny - Fundament Projektu",
    items: [
      "Spotkanie na inwestycji podczas inwentaryzacji lub analiza materiałów.",
      "Rozpoczęcie pracy nad układem funkcji.",
      "Spotkanie prezentujące układ funkcjonalny, możliwe online.",
      "Omówienie korekt, akceptacja układu funkcji i rozliczenie drugiej raty.",
      "Rozpoczęcie opracowania technicznego i możliwość startu prac wykonawczych.",
    ],
  },
  {
    title: "ETAP 3: Szczegóły Techniczne",
    items: [
      "Spotkanie prezentujące opracowanie techniczne, możliwe online.",
      "Przygotowanie do wizualizacji i omówienie stylistyki.",
      "Rozliczenie trzeciej raty projektu.",
      "Rozpoczęcie pracy nad aranżacją i wizualizacjami.",
      "Kontynuacja prac wykonawczych na budowie możliwa również na tym etapie.",
    ],
  },
  {
    title: "ETAP 4: Wizualizacje i Materiały",
    items: [
      "Spotkanie prezentujące komplet wizualizacji, zalecane w studio ze względu na próbki materiałów.",
      "Omówienie zmian, korekt i propozycji materiałów.",
      "Rozliczenie czwartej raty projektu.",
      "Dla projektu koncepcyjnego: zakończenie pracy projektowej.",
      "Dla projektu pełnego: przygotowanie zmian wizualizacji i kolejne spotkania korekt.",
    ],
  },
  {
    title: "ETAP 5: Opracowanie Wykonawcze i Finalizacja",
    items: [
      "Przygotowanie opracowania wykonawczego wraz z aktualizacją opracowania technicznego.",
      "Spotkanie prezentujące komplet projektu.",
      "Omówienie projektu, prac wykonawczych, ofert zakupowych oraz usług dodatkowych.",
      "Rozliczenie piątej raty projektu.",
    ],
  },
];

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
  const [discountCode, setDiscountCode] = useState("");

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

  const discountPercent = getDiscountPercentFromCode(discountCode);
  const offer = useMemo(
    () => calculateOffer(meters, discountPercent),
    [meters, discountPercent],
  );

  const invalidMeters = PROJECT_PRICING.some((project) => {
    const value = parseInputNumber(meterInputs[project.id]);
    return hasInvalidNumber(meterInputs[project.id]) || value < 0;
  });
  const invalidDiscount = !isValidDiscountCode(discountCode);
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
          <div className="relative flex justify-end">
            <Image
              src="/ossgaleria-logo.jpg"
              alt="Ossgaleria"
              width={180}
              height={72}
              className="h-12 w-auto rounded-xl opacity-70 mix-blend-screen grayscale contrast-125"
            />
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
            </div>
            <div className="hidden gap-3 sm:grid sm:grid-cols-3">
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
                    Kod rabatowy
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-stone-400">
                    Wpisz kod w formacie rabat10, rabat20 itd. Liczba w kodzie
                    oznacza procent rabatu.
                  </p>
                </div>
                <div className="space-y-2">
                  <Input
                    autoCapitalize="none"
                    placeholder="rabat10"
                    value={discountCode}
                    onChange={(event) => setDiscountCode(event.target.value)}
                    aria-label="Kod rabatowy"
                  />
                  {invalidDiscount ? (
                    <p className="text-xs text-red-300">
                      Kod musi mieć format rabat10, rabat20 itd. Maksymalnie 100%.
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
                    label="Kod rabatowy"
                    value={
                      discountCode.trim()
                        ? `${discountCode.trim().toLowerCase()} · ${formatPercent(
                            offer.discountPercent,
                          )}%`
                        : "brak"
                    }
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
                    discountCode={discountCode}
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

        <InfoSections />
      </div>
    </main>
  );
}

function InfoSections() {
  return (
    <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
      <Card className="p-6 md:p-8">
        <CardHeader>
          <CardTitle>Zakres opracowań</CardTitle>
          <CardDescription>
            Szczegóły pakietów są ukryte pod spodem, żeby kalkulacja pozostała
            najważniejsza.
          </CardDescription>
        </CardHeader>
        <div className="mt-6 space-y-3">
          {PROJECT_DESCRIPTIONS.map((project) => (
            <details
              key={project.title}
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                <span>
                  <span className="block font-semibold text-stone-50">
                    {project.title}
                  </span>
                  <span className="mt-1 block text-sm text-amber-100/70">
                    {project.price}
                  </span>
                </span>
                <span className="text-sm text-stone-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                {project.description}
              </p>
            </details>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:p-8">
        <CardHeader>
          <CardTitle>Harmonogram pracy</CardTitle>
          <CardDescription>
            Kluczowe etapy współpracy od pierwszego kontaktu po przekazanie
            gotowego projektu.
          </CardDescription>
        </CardHeader>
        <div className="mt-6 space-y-3">
          {WORKFLOW_STAGES.map((stage) => (
            <details
              key={stage.title}
              className="group rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-5"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-stone-50">
                {stage.title}
                <span className="text-sm text-stone-400 transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <ul className="mt-4 space-y-2 text-sm leading-6 text-stone-300">
                {stage.items.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-300" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      </Card>

      <Card className="p-6 md:col-span-2 md:p-8">
        <details>
          <summary className="cursor-pointer list-none font-semibold text-stone-50">
            Jak liczyć metraż w praktyce?
          </summary>
          <div className="mt-4 grid gap-4 text-sm leading-7 text-stone-300 lg:grid-cols-2">
            <p>
              Jeśli chcesz zaprojektować wnętrze domu o powierzchni 200 m², z
              czego 40 m² zajmują garaż i kotłownia, do kalkulacji możesz
              przyjąć 160 m², ponieważ garaż i pomieszczenia techniczne zwykle
              są opracowywane gratis.
            </p>
            <p>
              Pozostałe 160 m² można podzielić na przykład na 100 m² projektu
              pełnego oraz 60 m² projektu technicznego. Opracowanie techniczne
              lub koncepcyjne można w późniejszym czasie rozwinąć.
            </p>
          </div>
        </details>
      </Card>
    </section>
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
