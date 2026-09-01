import AsyncStorage from "@react-native-async-storage/async-storage";

const activeWorkspaceKeyPrefix = "flatdues.active-workspace.v1";

function getActiveWorkspaceKey(userId: string) {
  return `${activeWorkspaceKeyPrefix}:${userId}`;
}

export function getStoredActiveWorkspaceId(userId: string) {
  return AsyncStorage.getItem(getActiveWorkspaceKey(userId));
}

export function storeActiveWorkspaceId(userId: string, workspaceId: string) {
  return AsyncStorage.setItem(getActiveWorkspaceKey(userId), workspaceId);
}

export function clearStoredActiveWorkspaceId(userId: string) {
  return AsyncStorage.removeItem(getActiveWorkspaceKey(userId));
}
