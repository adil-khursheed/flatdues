import { formatCurrency } from "./format-currency";

export const MAX_MONEY_MINOR_UNITS = 999_999_999_999;

export type ParsedMoney = Readonly<{
  decimal: string;
  minorUnits: number;
}>;

export type SplitPreview = Readonly<{
  baseShareMinorUnits: number;
  remainderMinorUnits: number;
}>;

export function parseMoneyInput(value: string): ParsedMoney | null {
  const normalized = value.trim();

  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  const normalizedWhole = wholePart.replace(/^0+(?=\d)/, "");
  const minorUnits =
    Number(normalizedWhole) * 100 + Number(fractionalPart.padEnd(2, "0"));

  if (
    !Number.isSafeInteger(minorUnits) ||
    minorUnits <= 0 ||
    minorUnits > MAX_MONEY_MINOR_UNITS
  ) {
    return null;
  }

  return {
    decimal: `${normalizedWhole}.${fractionalPart.padEnd(2, "0")}`,
    minorUnits,
  };
}

export function minorUnitsToDecimal(minorUnits: number) {
  if (!Number.isSafeInteger(minorUnits)) {
    throw new Error("MONEY_MINOR_UNITS_INVALID");
  }

  const sign = minorUnits < 0 ? "-" : "";
  const absolute = Math.abs(minorUnits);
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

export function calculateSplitPreview(
  minorUnits: number,
  participantCount: number
): SplitPreview | null {
  if (
    !Number.isSafeInteger(minorUnits) ||
    minorUnits <= 0 ||
    !Number.isInteger(participantCount) ||
    participantCount <= 0 ||
    minorUnits < participantCount
  ) {
    return null;
  }

  return {
    baseShareMinorUnits: Math.floor(minorUnits / participantCount),
    remainderMinorUnits: minorUnits % participantCount,
  };
}

export function formatMinorUnits(
  minorUnits: number,
  currency: string,
  locale?: string
) {
  return formatCurrency(minorUnitsToDecimal(minorUnits), currency, locale);
}
