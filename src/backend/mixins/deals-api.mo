import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import DealTypes "../types/deals";
import DealLib "../lib/deals";

// Public API mixin for Deal Management & Contract Vault (Part 11.1).
// Receives injected state slices: deals map, accessControlState, nextEntityId counter, and addChangeEvent callback.
mixin (
  deals : Map.Map<DealLib.DealId, DealLib.Deal>,
  accessControlState : AccessControl.State,
  nextEntityId : Nat,
  addChangeEvent : (Text, [Text], { #create; #update; #link }, Principal) -> (),
) {
  // Create a new deal record.
  // Caller must have at least user-level permission.
  public shared ({ caller }) func createDeal(request : DealLib.CreateDealRequest) : async DealLib.Deal {
    Runtime.trap("not implemented");
  };

  // Retrieve all deals visible to the caller.
  // Admins see every deal; regular users see only deals they created or are linked to.
  public query ({ caller }) func getDeals() : async [DealLib.Deal] {
    Runtime.trap("not implemented");
  };

  // Retrieve a single deal by id.
  // Caller must be the creator, listed party, or an admin.
  public query ({ caller }) func getDealDetails(id : DealLib.DealId) : async DealLib.Deal {
    Runtime.trap("not implemented");
  };

  // Update an existing deal's fields.
  // Caller must be the creator or an admin.
  public shared ({ caller }) func updateDeal(
    id : DealLib.DealId,
    request : DealLib.CreateDealRequest,
  ) : async DealLib.Deal {
    Runtime.trap("not implemented");
  };

  // Permanently delete a deal.
  // Only the creator or an admin may delete.
  public shared ({ caller }) func deleteDeal(id : DealLib.DealId) : async () {
    Runtime.trap("not implemented");
  };
};
