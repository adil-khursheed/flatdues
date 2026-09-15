import type { LocalDateKey } from "@/utils/local-date";

type ExpenseDatePickerProps = Readonly<{
  onChange: (value: LocalDateKey) => void;
  value: LocalDateKey;
}>;

export function ExpenseDatePicker(_props: ExpenseDatePickerProps) {
  return null;
}
