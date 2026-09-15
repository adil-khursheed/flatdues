import type { CreateWorkspaceInviteInput } from "./types";

export const defaultInviteDays = 7;
export const defaultInviteMaxUses = 5;

function parseBoundedInteger(value: string, minimum: number, maximum: number) {
  if (!/^\d+$/.test(value.trim())) {
    return null;
  }

  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

export function validateInviteDays(value: string) {
  return parseBoundedInteger(value, 1, 30) === null
    ? "Enter a whole number from 1 to 30."
    : null;
}

export function validateInviteMaxUses(value: string) {
  return parseBoundedInteger(value, 1, 50) === null
    ? "Enter a whole number from 1 to 50."
    : null;
}

export function parseInviteConfiguration(
  validForDays: string,
  maxUses: string
): CreateWorkspaceInviteInput | null {
  const parsedDays = parseBoundedInteger(validForDays, 1, 30);
  const parsedUses = parseBoundedInteger(maxUses, 1, 50);

  return parsedDays === null || parsedUses === null
    ? null
    : { maxUses: parsedUses, validForDays: parsedDays };
}
