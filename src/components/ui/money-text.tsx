import type { AppTextProps, AppTextTone } from "./app-text";
import { AppText } from "./app-text";
import { formatCurrency } from "@/utils/format-currency";

export type MoneyTextProps = Omit<AppTextProps, "children" | "tone"> & {
  amount: number | string;
  currency?: string;
  locale?: string;
  state?: "negative" | "neutral" | "positive";
};

export function MoneyText({
  amount,
  currency = "INR",
  locale,
  state = "neutral",
  variant = "heading",
  ...props
}: MoneyTextProps) {
  const tones: Record<NonNullable<MoneyTextProps["state"]>, AppTextTone> = {
    negative: "negative",
    neutral: "default",
    positive: "positive",
  };

  return (
    <AppText {...props} tone={tones[state]} variant={variant}>
      {formatCurrency(amount, currency, locale)}
    </AppText>
  );
}
