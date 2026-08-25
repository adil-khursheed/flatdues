type CurrencyAmount = number | string;

export function formatCurrency(
  amount: CurrencyAmount,
  currency = "INR",
  locale?: string,
) {
  const numericAmount =
    typeof amount === "number" ? amount : Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return "—";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}
