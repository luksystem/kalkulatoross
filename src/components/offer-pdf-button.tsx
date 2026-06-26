"use client";

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

const formatMeters = (value: number) =>
  new Intl.NumberFormat("pl-PL", {
    maximumFractionDigits: 2,
  }).format(value);

export function OfferPdfButton({
  client,
  offer,
  disabled,
}: OfferPdfButtonProps) {
  const handleDownload = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 18;
    let y = 22;

    const addPageIfNeeded = (height = 8) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addLine = (text: string, options?: { bold?: boolean; size?: number }) => {
      addPageIfNeeded(7);
      doc.setFont("helvetica", options?.bold ? "bold" : "normal");
      doc.setFontSize(options?.size ?? 10);
      doc.text(text, margin, y);
      y += 6;
    };

    const addWrapped = (text: string) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
      lines.forEach((line: string) => addLine(line));
    };

    doc.setFillColor(246, 241, 234);
    doc.rect(0, 0, pageWidth, 48, "F");
    doc.setTextColor(31, 26, 23);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Wycena projektu wnętrz", margin, y);
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("Miejsce na logo / nazwę firmy", margin, y);
    y += 18;

    addLine(`Data wygenerowania: ${formatDate(new Date())}`, { bold: true });
    y += 2;
    addLine("Dane klienta", { bold: true, size: 13 });
    addLine(`Imię i nazwisko: ${client.name}`);
    addLine(`E-mail: ${client.email}`);
    addLine(`Telefon: ${client.phone}`);
    y += 3;

    addLine("Wybrane typy projektu", { bold: true, size: 13 });
    offer.selectedProjects.forEach((project) => {
      addLine(
        `${project.name}: ${formatMeters(project.meters)} m² × ${formatCurrency(
          project.ratePerM2,
        )} / m² = ${formatCurrency(project.basePrice)}`,
      );
    });
    y += 3;

    addLine("Podsumowanie ceny", { bold: true, size: 13 });
    addLine(`Cena bazowa: ${formatCurrency(offer.basePrice)}`);
    addLine(
      `Rabat: ${formatPercent(offer.discountPercent)}% (${formatCurrency(
        offer.discountAmount,
      )})`,
    );
    addLine(`Cena końcowa: ${formatCurrency(offer.finalPrice)}`, {
      bold: true,
      size: 12,
    });
    y += 3;

    addLine("Rozbicie na raty", { bold: true, size: 13 });
    offer.selectedProjects.forEach((project) => {
      addLine(project.name, { bold: true });
      project.installments.forEach((installment) => {
        addLine(
          `${installment.label}: ${formatPercent(
            installment.percent,
          )}% - ${formatCurrency(installment.amount)}`,
        );
      });
      y += 2;
    });

    if (offer.selectedProjects.length > 1) {
      addLine("Podsumowanie łączne rat", { bold: true });
      offer.totalInstallments.forEach((installment) => {
        addLine(`${installment.label}: ${formatCurrency(installment.amount)}`);
      });
      y += 2;
    }

    addWrapped(
      "Oferta została wygenerowana automatycznie na podstawie wybranych parametrów.",
    );

    const fileName = `wycena-projektu-wnetrz-${new Date()
      .toISOString()
      .slice(0, 10)}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button
      className="w-full gap-2"
      disabled={disabled}
      onClick={handleDownload}
      type="button"
    >
      <Download className="h-4 w-4" aria-hidden="true" />
      Pobierz ofertę PDF
    </Button>
  );
}
