import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="workspace-setup" />
      <Stack.Screen name="create-workspace" />
      <Stack.Screen name="join-workspace" />
    </Stack>
  );
}
