export type LocalDateKey = `${number}-${number}-${number}`;

const localDatePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function toLocalDateKey(date: Date): LocalDateKey {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` as LocalDateKey;
}

export function isLocalDateKey(value: string): value is LocalDateKey {
  const match = localDatePattern.exec(value);

  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function localDateKeyToDate(value: string) {
  if (!isLocalDateKey(value)) {
    throw new Error("LOCAL_DATE_INVALID");
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

export function formatLocalDate(
  value: string,
  options?: Readonly<{ locale?: string; now?: Date }>
) {
  if (!isLocalDateKey(value)) {
    return "—";
  }

  if (value === toLocalDateKey(options?.now ?? new Date())) {
    return "Today";
  }

  return new Intl.DateTimeFormat(options?.locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(localDateKeyToDate(value));
}
