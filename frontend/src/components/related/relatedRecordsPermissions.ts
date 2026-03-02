import { Principal } from '@dfinity/principal';
import type { Identity } from '@icp-sdk/core/agent';

/**
 * Determines if the current user can edit a record based on ownership or admin status.
 * Includes defensive handling for upgrade-time missing/undefined values.
 */
export function canEditRecord(
  identity: Identity | undefined,
  isAdmin: boolean,
  recordOwner: Principal | undefined
): boolean {
  // Defensive: if identity is missing, deny access
  if (!identity) return false;
  
  // Admins can always edit
  if (isAdmin) return true;
  
  // Defensive: if recordOwner is missing, deny access (safer default)
  if (!recordOwner) return false;
  
  try {
    const callerPrincipal = identity.getPrincipal().toString();
    const ownerPrincipal = recordOwner.toString();
    
    return callerPrincipal === ownerPrincipal;
  } catch (error) {
    // Defensive: if principal comparison fails, deny access
    console.error('Error comparing principals:', error);
    return false;
  }
}

/**
 * Determines if the current user can edit a membership based on membership principal or admin status.
 * Includes defensive handling for upgrade-time missing/undefined values.
 */
export function canEditMembership(
  identity: Identity | undefined,
  isAdmin: boolean,
  membershipPrincipal: Principal | undefined
): boolean {
  // Defensive: if identity is missing, deny access
  if (!identity) return false;
  
  // Admins can always edit
  if (isAdmin) return true;
  
  // Defensive: if membershipPrincipal is missing, deny access (safer default)
  if (!membershipPrincipal) return false;
  
  try {
    const callerPrincipal = identity.getPrincipal().toString();
    const memberPrincipal = membershipPrincipal.toString();
    
    return callerPrincipal === memberPrincipal;
  } catch (error) {
    // Defensive: if principal comparison fails, deny access
    console.error('Error comparing principals:', error);
    return false;
  }
}

// Alias functions for specific entity types (all use the same logic)
export const canEditPublishingWork = canEditRecord;
export const canEditRelease = canEditRecord;
export const canEditRecordingProject = canEditRecord;
export const canEditArtistDevelopment = canEditRecord;
