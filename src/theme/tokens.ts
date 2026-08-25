export const spacing = {
  none: 0,
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 10,
  md: 16,
  lg: 24,
  pill: 999,
} as const;

export const typography = {
  display: { fontSize: 34, lineHeight: 41, fontWeight: "700" },
  title: { fontSize: 26, lineHeight: 32, fontWeight: "700" },
  heading: { fontSize: 20, lineHeight: 26, fontWeight: "600" },
  body: { fontSize: 16, lineHeight: 24, fontWeight: "400" },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: "600" },
  label: { fontSize: 14, lineHeight: 20, fontWeight: "600" },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: "400" },
} as const;

const lightColors = {
  background: "#F3F7F4",
  surface: "#FFFFFF",
  surfaceMuted: "#EAF1EC",
  text: "#142019",
  textMuted: "#647068",
  border: "#D8E3DC",
  accent: "#176B4D",
  accentPressed: "#0F563D",
  accentSoft: "#DDF2E8",
  onAccent: "#FFFFFF",
  positive: "#18794E",
  positiveSoft: "#DDF3E8",
  negative: "#B83232",
  negativeSoft: "#FBE4E4",
  warning: "#8A5A12",
  warningSoft: "#F9EBCF",
  focus: "#2E8B68",
  shadow: "#10251A",
} as const;

const darkColors = {
  background: "#0E1511",
  surface: "#17211B",
  surfaceMuted: "#202D25",
  text: "#F3F8F5",
  textMuted: "#A6B2AA",
  border: "#304037",
  accent: "#72D4AA",
  accentPressed: "#55BB90",
  accentSoft: "#173D2C",
  onAccent: "#082018",
  positive: "#72D4AA",
  positiveSoft: "#173D2C",
  negative: "#FF938E",
  negativeSoft: "#4B2423",
  warning: "#F1C879",
  warningSoft: "#46381D",
  focus: "#72D4AA",
  shadow: "#000000",
} as const;

export type AppColors = {
  [Key in keyof typeof lightColors]: string;
};

export type AppTheme = Readonly<{
  colors: AppColors;
  isDark: boolean;
}>;

export const themes: Readonly<Record<"dark" | "light", AppTheme>> = {
  light: { colors: lightColors, isDark: false },
  dark: { colors: darkColors, isDark: true },
};
