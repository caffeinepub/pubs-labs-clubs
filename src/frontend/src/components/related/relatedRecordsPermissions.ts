import { Principal } from '@dfinity/principal';
import type { Identity } from '@icp-sdk/core/agent';

export function canEditRecord(
  identity: Identity | undefined,
  isAdmin: boolean,
  recordOwner: Principal | undefined
): boolean {
  if (!identity) return false;
  if (isAdmin) return true;
  if (!recordOwner) return false;
  
  const callerPrincipal = identity.getPrincipal().toString();
  const ownerPrincipal = recordOwner.toString();
  
  return callerPrincipal === ownerPrincipal;
}

export function canEditMembership(
  identity: Identity | undefined,
  isAdmin: boolean,
  membershipPrincipal: Principal | undefined
): boolean {
  if (!identity) return false;
  if (isAdmin) return true;
  if (!membershipPrincipal) return false;
  
  const callerPrincipal = identity.getPrincipal().toString();
  const memberPrincipal = membershipPrincipal.toString();
  
  return callerPrincipal === memberPrincipal;
}

// Alias functions for specific entity types (all use the same logic)
export const canEditPublishingWork = canEditRecord;
export const canEditRelease = canEditRecord;
export const canEditRecordingProject = canEditRecord;
export const canEditArtistDevelopment = canEditRecord;
