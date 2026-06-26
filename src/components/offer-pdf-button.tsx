"use client";

import { useRef, useState, type ReactNode } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { CalculationResult, ClientData } from "@/lib/types";

type OfferPdfButtonProps = {
  client: ClientData;
  offer: CalculationResult;
  disabled: boolean;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

const formatDateTime = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const formatMeters = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 2,
  }).format(value);

export function OfferPdfButton({
  client,
  offer,
  disabled,
}: OfferPdfButtonProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [generatedAt, setGeneratedAt] = useState(() => new Date());

  const handleDownload = async () => {
    const exportDate = new Date();
    setGeneratedAt(exportDate);
    await new Promise((resolve) => requestAnimationFrame(resolve));

    if (!reportRef.current) {
      return;
    }

    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");
    const canvas = await html2canvas(reportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      windowWidth: reportRef.current.scrollWidth,
    });

    const doc = new jsPDF({ unit: "px", format: "a4", orientation: "portrait" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imageWidth = pageWidth;
    const imageHeight = (canvas.height * imageWidth) / canvas.width;
    const pageCanvas = document.createElement("canvas");
    const pageContext = pageCanvas.getContext("2d");
    const sourcePageHeight = Math.floor((pageHeight * canvas.width) / pageWidth);
    let sourceY = 0;
    let pageIndex = 0;

    if (!pageContext) {
      return;
    }

    pageCanvas.width = canvas.width;

    while (sourceY < canvas.height) {
      const remainingHeight = canvas.height - sourceY;
      const sliceHeight = Math.min(sourcePageHeight, remainingHeight);
      pageCanvas.height = sliceHeight;
      pageContext.clearRect(0, 0, pageCanvas.width, pageCanvas.height);
      pageContext.drawImage(
        canvas,
        0,
        sourceY,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight,
      );

      if (pageIndex > 0) {
        doc.addPage();
      }

      const pageImageHeight = (sliceHeight * imageWidth) / canvas.width;
      doc.addImage(
        pageCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imageWidth,
        Math.min(pageImageHeight, imageHeight),
      );

      sourceY += sliceHeight;
      pageIndex += 1;
    }

    const fileName = `wycena-projektu-wnetrz-${exportDate
      .toISOString()
      .slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <>
      <Button
        className="w-full gap-2"
        disabled={disabled}
        onClick={handleDownload}
        type="button"
      >
        <Download className="h-4 w-4" aria-hidden="true" />
        Pobierz ofertę PDF
      </Button>

      <div className="pointer-events-none fixed -left-[9999px] top-0">
        <div
          ref={reportRef}
          className="w-[794px] bg-white p-12 text-[#1c1917]"
          style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
        >
          <header className="overflow-hidden rounded-[28px] bg-[#11100f] p-10 text-white">
            <div className="flex items-start justify-between gap-10">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#d6b36e]">
                  Raport wyceny
                </p>
                <h1 className="mt-5 text-[34px] font-bold leading-tight">
                  Wycena projektu wnętrz
                </h1>
                <p className="mt-4 max-w-[420px] text-[13px] leading-6 text-[#d7d3cb]">
                  Profesjonalne podsumowanie oferty przygotowane automatycznie na
                  podstawie wybranych parametrów projektu.
                </p>
              </div>
              <div className="min-w-[180px] rounded-2xl border border-white/15 p-5 text-right">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#bdb7ae]">
                  Miejsce na logo
                </p>
                <p className="mt-3 text-lg font-bold">Nazwa firmy</p>
              </div>
            </div>
          </header>

          <section className="mt-8 grid grid-cols-3 gap-4">
            <PdfInfoCard label="Data wygenerowania" value={formatDate(generatedAt)} />
            <PdfInfoCard
              label="Godzina wygenerowania"
              value={new Intl.DateTimeFormat("pl-PL", {
                hour: "2-digit",
                minute: "2-digit",
              }).format(generatedAt)}
            />
            <PdfInfoCard
              label="Cena końcowa"
              value={formatCurrency(offer.finalPrice)}
              highlight
            />
          </section>

          <section className="mt-8 rounded-[24px] border border-[#e7dfd2] p-7">
            <PdfSectionTitle>Dane klienta</PdfSectionTitle>
            <div className="mt-5 grid grid-cols-3 gap-4 text-[13px]">
              <PdfDataPoint label="Imię i nazwisko" value={client.name} />
              <PdfDataPoint label="E-mail" value={client.email} />
              <PdfDataPoint label="Telefon" value={client.phone} />
            </div>
          </section>

          <section className="mt-8 rounded-[24px] border border-[#e7dfd2] p-7">
            <PdfSectionTitle>Zakres i stawki</PdfSectionTitle>
            <table className="mt-5 w-full border-collapse text-left text-[13px]">
              <thead>
                <tr className="border-b border-[#e7dfd2] text-[11px] uppercase tracking-[0.16em] text-[#7a7166]">
                  <th className="py-3 font-bold">Typ projektu</th>
                  <th className="py-3 text-right font-bold">Metraż</th>
                  <th className="py-3 text-right font-bold">Stawka / m²</th>
                  <th className="py-3 text-right font-bold">Wartość</th>
                </tr>
              </thead>
              <tbody>
                {offer.selectedProjects.map((project) => (
                  <tr key={project.id} className="border-b border-[#f0ebe3]">
                    <td className="py-4 font-bold">{project.name}</td>
                    <td className="py-4 text-right">
                      {formatMeters(project.meters)} m²
                    </td>
                    <td className="py-4 text-right">
                      {formatCurrency(project.ratePerM2)}
                    </td>
                    <td className="py-4 text-right font-bold">
                      {formatCurrency(project.basePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="mt-8 grid grid-cols-3 gap-4">
            <PdfInfoCard label="Cena bazowa" value={formatCurrency(offer.basePrice)} />
            <PdfInfoCard
              label="Rabat"
              value={`${formatPercent(offer.discountPercent)}% (${formatCurrency(
                offer.discountAmount,
              )})`}
            />
            <PdfInfoCard
              label="Cena po rabacie"
              value={formatCurrency(offer.finalPrice)}
              highlight
            />
          </section>

          <section className="mt-8 rounded-[24px] border border-[#e7dfd2] p-7">
            <PdfSectionTitle>Harmonogram płatności</PdfSectionTitle>
            <div className="mt-5 space-y-6">
              {offer.selectedProjects.map((project) => (
                <div key={project.id} className="rounded-2xl bg-[#f8f3ea] p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-[15px] font-bold">{project.name}</h3>
                    <p className="text-[13px] font-bold text-[#85622b]">
                      {formatCurrency(project.finalPrice)}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    {project.installments.map((installment) => (
                      <div
                        key={installment.label}
                        className="flex justify-between rounded-xl bg-white px-4 py-3 text-[12px]"
                      >
                        <span>
                          {installment.label} · {formatPercent(installment.percent)}%
                        </span>
                        <strong>{formatCurrency(installment.amount)}</strong>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {offer.selectedProjects.length > 1 ? (
            <section className="mt-8 rounded-[24px] bg-[#11100f] p-7 text-white">
              <PdfSectionTitle light>Podsumowanie łączne rat</PdfSectionTitle>
              <div className="mt-5 grid grid-cols-2 gap-3">
                {offer.totalInstallments.map((installment) => (
                  <div
                    key={installment.label}
                    className="flex justify-between rounded-xl border border-white/10 px-4 py-3 text-[12px]"
                  >
                    <span className="text-[#d7d3cb]">{installment.label}</span>
                    <strong>{formatCurrency(installment.amount)}</strong>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <footer className="mt-8 rounded-[24px] border border-[#e7dfd2] bg-[#fbf8f2] p-7 text-[12px] leading-6 text-[#5f574f]">
            <p>
              Oferta została wygenerowana automatycznie na podstawie wybranych
              parametrów. Wycena ma charakter informacyjny i może zostać
              doprecyzowana po analizie szczegółowego zakresu projektu.
            </p>
            <p className="mt-4 font-bold text-[#1c1917]">
              Wygenerowano: {formatDateTime(generatedAt)}
            </p>
          </footer>
        </div>
      </div>
    </>
  );
}

function PdfSectionTitle({
  children,
  light = false,
}: {
  children: ReactNode;
  light?: boolean;
}) {
  return (
    <h2
      className={`text-[18px] font-bold ${
        light ? "text-white" : "text-[#1c1917]"
      }`}
    >
      {children}
    </h2>
  );
}

function PdfInfoCard({
  highlight = false,
  label,
  value,
}: {
  highlight?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div
      className={`rounded-[20px] p-5 ${
        highlight ? "bg-[#11100f] text-white" : "border border-[#e7dfd2] bg-[#fbf8f2]"
      }`}
    >
      <p
        className={`text-[10px] font-bold uppercase tracking-[0.16em] ${
          highlight ? "text-[#d6b36e]" : "text-[#7a7166]"
        }`}
      >
        {label}
      </p>
      <p className="mt-3 text-[16px] font-bold">{value}</p>
    </div>
  );
}

function PdfDataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#7a7166]">
        {label}
      </p>
      <p className="mt-2 font-bold text-[#1c1917]">{value}</p>
    </div>
  );
}
