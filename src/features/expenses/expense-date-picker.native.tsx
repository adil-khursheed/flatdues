import ExpoDateTimePicker from "@expo/ui/community/datetime-picker";
import { useAppTheme } from "@/theme";
import {
  localDateKeyToDate,
  toLocalDateKey,
  type LocalDateKey,
} from "@/utils/local-date";

type ExpenseDatePickerProps = Readonly<{
  onChange: (value: LocalDateKey) => void;
  value: LocalDateKey;
}>;

export function ExpenseDatePicker({ onChange, value }: ExpenseDatePickerProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <ExpoDateTimePicker
      accentColor={colors.accent}
      mode="date"
      onValueChange={(_event, selectedDate) =>
        onChange(toLocalDateKey(selectedDate))
      }
      presentation="inline"
      themeVariant={isDark ? "dark" : "light"}
      value={localDateKeyToDate(value)}
    />
  );
}
