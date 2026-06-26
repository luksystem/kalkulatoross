"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from "@/lib/calculations";
import type { CalculationResult, ClientData } from "@/lib/types";

type OfferPdfButtonProps = {
  client: ClientData;
  discountCode: string;
  offer: CalculationResult;
  disabled: boolean;
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const buildReportHtml = ({
  client,
  discountCode,
  generatedAt,
  logoUrl,
  offer,
}: {
  client: ClientData;
  discountCode: string;
  generatedAt: Date;
  logoUrl: string;
  offer: CalculationResult;
}) => {
  const normalizedDiscountCode = discountCode.trim().toLowerCase();
  const discountLabel = normalizedDiscountCode
    ? `${escapeHtml(normalizedDiscountCode)} · ${formatPercent(
        offer.discountPercent,
      )}%`
    : "brak";

  const projectRows = offer.selectedProjects
    .map(
      (project) => `
        <tr>
          <td><strong>${escapeHtml(project.name)}</strong></td>
          <td class="right">${formatMeters(project.meters)} m²</td>
          <td class="right">${formatCurrency(project.ratePerM2)}</td>
          <td class="right"><strong>${formatCurrency(project.basePrice)}</strong></td>
        </tr>
      `,
    )
    .join("");

  const projectInstallments = offer.selectedProjects
    .map(
      (project) => `
        <section class="installment-card">
          <div class="row between">
            <h3>${escapeHtml(project.name)}</h3>
            <strong class="gold">${formatCurrency(project.finalPrice)}</strong>
          </div>
          <div class="installment-grid">
            ${project.installments
              .map(
                (installment) => `
                  <div class="installment">
                    <span>${escapeHtml(installment.label)} · ${formatPercent(
                      installment.percent,
                    )}%</span>
                    <strong>${formatCurrency(installment.amount)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      `,
    )
    .join("");

  const totalInstallments =
    offer.selectedProjects.length > 1
      ? `
        <section class="dark-section">
          <h2>Podsumowanie łączne rat</h2>
          <div class="installment-grid">
            ${offer.totalInstallments
              .map(
                (installment) => `
                  <div class="dark-installment">
                    <span>${escapeHtml(installment.label)}</span>
                    <strong>${formatCurrency(installment.amount)}</strong>
                  </div>
                `,
              )
              .join("")}
          </div>
        </section>
      `
      : "";

  return `
    <style>
      * { box-sizing: border-box; }
      .pdf-root {
        background: #ffffff;
        color: #1c1917;
        font-family: Arial, Helvetica, sans-serif;
        width: 794px;
      }
      .pdf-page {
        background: #ffffff;
        min-height: 1123px;
        padding: 44px;
        width: 794px;
      }
      .hero {
        background: #11100f;
        border-radius: 28px;
        color: #ffffff;
        padding: 34px;
      }
      .row { display: flex; gap: 24px; align-items: flex-start; }
      .between { justify-content: space-between; align-items: center; }
      .hero-copy { flex: 1; }
      .eyebrow {
        color: #d6b36e;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.28em;
        margin: 0;
        text-transform: uppercase;
      }
      h1 {
        font-size: 34px;
        line-height: 1.08;
        margin: 18px 0 0;
      }
      h2 { font-size: 18px; margin: 0; }
      h3 { font-size: 15px; margin: 0; }
      p { margin: 0; }
      .hero-description {
        color: #d7d3cb;
        font-size: 13px;
        line-height: 1.75;
        margin-top: 14px;
        max-width: 430px;
      }
      .logo-box {
        background: #ffffff;
        border-radius: 18px;
        min-width: 175px;
        padding: 16px;
        text-align: right;
      }
      .logo-box img {
        display: block;
        margin-left: auto;
        max-height: 58px;
        max-width: 150px;
        object-fit: contain;
      }
      .cards {
        display: grid;
        gap: 14px;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 26px;
      }
      .info-card {
        background: #fbf8f2;
        border: 1px solid #e7dfd2;
        border-radius: 20px;
        padding: 18px;
      }
      .info-card.dark {
        background: #11100f;
        color: #ffffff;
      }
      .label {
        color: #7a7166;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.16em;
        text-transform: uppercase;
      }
      .info-card.dark .label { color: #d6b36e; }
      .value {
        font-size: 15px;
        font-weight: 700;
        margin-top: 10px;
      }
      .section {
        border: 1px solid #e7dfd2;
        border-radius: 24px;
        margin-top: 26px;
        padding: 24px;
      }
      .data-grid {
        display: grid;
        gap: 16px;
        grid-template-columns: repeat(3, 1fr);
        margin-top: 18px;
      }
      .data-value {
        font-size: 13px;
        font-weight: 700;
        margin-top: 8px;
      }
      table {
        border-collapse: collapse;
        font-size: 13px;
        margin-top: 18px;
        width: 100%;
      }
      th {
        border-bottom: 1px solid #e7dfd2;
        color: #7a7166;
        font-size: 11px;
        letter-spacing: 0.16em;
        padding: 11px 0;
        text-align: left;
        text-transform: uppercase;
      }
      td {
        border-bottom: 1px solid #f0ebe3;
        padding: 14px 0;
      }
      .right { text-align: right; }
      .installment-card {
        background: #f8f3ea;
        border-radius: 18px;
        margin-top: 18px;
        padding: 18px;
      }
      .gold { color: #85622b; }
      .installment-grid {
        display: grid;
        gap: 10px;
        grid-template-columns: repeat(2, 1fr);
        margin-top: 14px;
      }
      .installment {
        background: #ffffff;
        border-radius: 12px;
        display: flex;
        font-size: 12px;
        justify-content: space-between;
        padding: 11px 13px;
      }
      .dark-section {
        background: #11100f;
        border-radius: 24px;
        color: #ffffff;
        margin-top: 24px;
        padding: 24px;
      }
      .dark-installment {
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 12px;
        display: flex;
        font-size: 12px;
        justify-content: space-between;
        padding: 11px 13px;
      }
      .dark-installment span { color: #d7d3cb; }
      .footer {
        background: #fbf8f2;
        border: 1px solid #e7dfd2;
        border-radius: 24px;
        color: #5f574f;
        font-size: 12px;
        line-height: 1.75;
        margin-top: 24px;
        padding: 24px;
      }
      .footer strong { color: #1c1917; }
    </style>

    <article class="pdf-root">
      <section class="pdf-page">
        <header class="hero">
          <div class="row between">
            <div class="hero-copy">
              <p class="eyebrow">Raport wyceny</p>
              <h1>Wycena projektu wnętrz</h1>
              <p class="hero-description">
                Profesjonalne podsumowanie oferty przygotowane automatycznie na podstawie wybranych parametrów projektu.
              </p>
            </div>
            <div class="logo-box">
              <img src="${logoUrl}" alt="Ossgaleria" />
            </div>
          </div>
        </header>

        <section class="cards">
          <div class="info-card">
            <p class="label">Data wygenerowania</p>
            <p class="value">${formatDate(generatedAt)}</p>
          </div>
          <div class="info-card">
            <p class="label">Godzina wygenerowania</p>
            <p class="value">${formatTime(generatedAt)}</p>
          </div>
          <div class="info-card dark">
            <p class="label">Cena końcowa</p>
            <p class="value">${formatCurrency(offer.finalPrice)}</p>
          </div>
        </section>

        <section class="section">
          <h2>Dane klienta</h2>
          <div class="data-grid">
            <div>
              <p class="label">Imię i nazwisko</p>
              <p class="data-value">${escapeHtml(client.name)}</p>
            </div>
            <div>
              <p class="label">E-mail</p>
              <p class="data-value">${escapeHtml(client.email)}</p>
            </div>
            <div>
              <p class="label">Telefon</p>
              <p class="data-value">${escapeHtml(client.phone)}</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>Zakres i stawki</h2>
          <table>
            <thead>
              <tr>
                <th>Typ projektu</th>
                <th class="right">Metraż</th>
                <th class="right">Stawka / m²</th>
                <th class="right">Wartość</th>
              </tr>
            </thead>
            <tbody>${projectRows}</tbody>
          </table>
        </section>

        <section class="cards">
          <div class="info-card">
            <p class="label">Cena bazowa</p>
            <p class="value">${formatCurrency(offer.basePrice)}</p>
          </div>
          <div class="info-card">
            <p class="label">Kod rabatowy</p>
            <p class="value">${discountLabel}</p>
          </div>
          <div class="info-card dark">
            <p class="label">Cena po rabacie</p>
            <p class="value">${formatCurrency(offer.finalPrice)}</p>
          </div>
        </section>
      </section>

      <section class="pdf-page">
        <section class="section" style="margin-top: 0;">
          <h2>Harmonogram płatności</h2>
          ${projectInstallments}
        </section>

        ${totalInstallments}

        <footer class="footer">
          <p>
            Oferta została wygenerowana automatycznie na podstawie wybranych parametrów.
            Wycena ma charakter informacyjny i może zostać doprecyzowana po analizie szczegółowego zakresu projektu.
          </p>
          <p style="margin-top: 16px;">
            <strong>Wygenerowano: ${formatDateTime(generatedAt)}</strong>
          </p>
        </footer>
      </section>
    </article>
  `;
};

export function OfferPdfButton({
  client,
  discountCode,
  offer,
  disabled,
}: OfferPdfButtonProps) {
  const handleDownload = async () => {
    const reportElement = document.createElement("div");
    const generatedAt = new Date();
    const logoUrl = `${window.location.origin}/ossgaleria-logo.jpg`;

    reportElement.innerHTML = buildReportHtml({
      client,
      discountCode,
      generatedAt,
      logoUrl,
      offer,
    });
    reportElement.style.background = "#ffffff";
    reportElement.style.left = "0";
    reportElement.style.pointerEvents = "none";
    reportElement.style.position = "fixed";
    reportElement.style.top = "0";
    reportElement.style.width = "794px";
    reportElement.style.zIndex = "-1";
    document.body.appendChild(reportElement);

    try {
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");
      const pages = Array.from(
        reportElement.querySelectorAll<HTMLElement>(".pdf-page"),
      );
      const doc = new jsPDF({
        format: "a4",
        orientation: "portrait",
        unit: "px",
      });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (const [pageIndex, page] of pages.entries()) {
        const canvas = await html2canvas(page, {
          backgroundColor: "#ffffff",
          scale: 2,
          useCORS: true,
          windowWidth: 794,
        });

        if (pageIndex > 0) {
          doc.addPage();
        }

        doc.addImage(
          canvas.toDataURL("image/png"),
          "PNG",
          0,
          0,
          pageWidth,
          pageHeight,
        );
      }

      doc.save(
        `wycena-projektu-wnetrz-${generatedAt.toISOString().slice(0, 10)}.pdf`,
      );
    } finally {
      reportElement.remove();
    }
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
