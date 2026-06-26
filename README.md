# Kalkulator ceny projektu wnętrz

Jednostronicowa aplikacja Next.js do szybkiego przygotowania wyceny projektu wnętrz z rabatem, harmonogramem rat i generowaniem PDF po stronie klienta.

## Uruchomienie

```bash
npm install
npm run dev
```

Po uruchomieniu aplikacja będzie dostępna pod adresem wskazanym przez Next.js, zwykle `http://localhost:3000`.

## Struktura

- `src/lib/pricing-config.ts` - stawki i harmonogramy rat.
- `src/lib/calculations.ts` - logika obliczeń, formatowanie i walidacja e-maila.
- `src/components/offer-pdf-button.tsx` - generowanie i pobieranie PDF.
- `src/components/ui` - proste komponenty UI w stylu shadcn.
- `src/app/page.tsx` - widok kalkulatora.
