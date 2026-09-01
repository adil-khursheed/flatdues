import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";

import type { ShareInviteInput } from "./types";

export async function copyInviteToken(token: string) {
  const didCopy = await Clipboard.setStringAsync(token);

  if (!didCopy) {
    throw new Error("INVITE_COPY_FAILED");
  }
}

export function readInviteTokenFromClipboard() {
  return Clipboard.getStringAsync();
}

export function shareWorkspaceInvite({
  token,
  workspaceName,
}: ShareInviteInput) {
  return Share.share({
    message: `Join ${workspaceName} on Flatdues. Open the app, choose Join Workspace, and paste this invite code:\n\n${token}`,
    title: `Join ${workspaceName} on Flatdues`,
  });
}
