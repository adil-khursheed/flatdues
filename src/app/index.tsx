import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth";

export default function IndexRoute() {
  const { activeMembership, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Redirect href={activeMembership ? "/home" : "/workspace-setup"} />
  );
}
