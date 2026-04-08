import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import DealTypes "../types/deals";

// Domain logic for Deal Management & Contract Vault.
// All functions receive the deals map as a parameter (stateless module style).
module {
  public type Deal = DealTypes.Deal;
  public type DealId = DealTypes.DealId;
  public type CreateDealRequest = DealTypes.CreateDealRequest;

  // Create a new deal record and insert it into the map.
  // Returns the newly created Deal.
  public func createDeal(
    deals : Map.Map<DealId, Deal>,
    id : DealId,
    caller : Principal,
    request : CreateDealRequest,
  ) : Deal {
    Runtime.trap("not implemented");
  };

  // Return a single deal by id.
  // Traps if not found.
  public func getDealById(
    deals : Map.Map<DealId, Deal>,
    id : DealId,
  ) : Deal {
    Runtime.trap("not implemented");
  };

  // Return all deals the caller is allowed to see.
  // Admins see all; regular users see deals they created or are linked to.
  public func getDealsForCaller(
    deals : Map.Map<DealId, Deal>,
    caller : Principal,
    isAdmin : Bool,
  ) : [Deal] {
    Runtime.trap("not implemented");
  };

  // Update an existing deal. Traps if not found or caller lacks permission.
  // Returns the updated Deal.
  public func updateDeal(
    deals : Map.Map<DealId, Deal>,
    id : DealId,
    caller : Principal,
    isAdmin : Bool,
    request : CreateDealRequest,
  ) : Deal {
    Runtime.trap("not implemented");
  };

  // Delete a deal. Only the creator or an admin may delete.
  // Traps if not found or unauthorized.
  public func deleteDeal(
    deals : Map.Map<DealId, Deal>,
    id : DealId,
    caller : Principal,
    isAdmin : Bool,
  ) : () {
    Runtime.trap("not implemented");
  };
};
