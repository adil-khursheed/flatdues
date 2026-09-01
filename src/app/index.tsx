import { Redirect } from "expo-router";

import { useAuth } from "@/features/auth";
import { useWorkspace } from "@/features/workspaces";

export default function IndexRoute() {
  const { isAuthenticated } = useAuth();
  const { activeMembership, pendingCreatedWorkspaceId } = useWorkspace();

  if (!isAuthenticated) {
    return <Redirect href="/sign-in" />;
  }

  if (!activeMembership) {
    return <Redirect href="/workspace-setup" />;
  }

  return (
    <Redirect
      href={
        pendingCreatedWorkspaceId === activeMembership.workspace_id
          ? "/workspace-created"
          : "/home"
      }
    />
  );
}
