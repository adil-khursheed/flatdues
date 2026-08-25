import { Image, StyleSheet, View } from "react-native";

import { radii, useAppTheme } from "@/theme";

import { AppText } from "./app-text";

type AvatarSize = "large" | "medium" | "small";

export type AvatarProps = {
  imageUrl?: string | null;
  name: string;
  size?: AvatarSize;
};

const avatarSizes: Record<AvatarSize, number> = {
  small: 32,
  medium: 44,
  large: 60,
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase())
    .join("");
}

export function Avatar({ imageUrl, name, size = "medium" }: AvatarProps) {
  const { colors } = useAppTheme();
  const dimension = avatarSizes[size];
  const sharedStyle = {
    borderRadius: radii.pill,
    height: dimension,
    width: dimension,
  };

  if (imageUrl) {
    return (
      <Image
        accessibilityLabel={`${name}'s avatar`}
        source={{ uri: imageUrl }}
        style={sharedStyle}
      />
    );
  }

  return (
    <View
      accessibilityLabel={`${name}'s initials`}
      style={[
        styles.fallback,
        sharedStyle,
        { backgroundColor: colors.accentSoft },
      ]}
    >
      <AppText tone="accent" variant={size === "small" ? "caption" : "label"}>
        {getInitials(name)}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
