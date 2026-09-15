import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="add-expense" />
      <Stack.Screen name="members" />
      <Stack.Screen name="invites" />
      <Stack.Screen name="workspace-created" />
    </Stack>
  );
}
