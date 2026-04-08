import Principal "mo:core/Principal";
import Time "mo:core/Time";

module {
  public type DealId = Text;

  // Deal type covering all agreement categories
  public type Deal = {
    id : DealId;
    title : Text;
    dealType : Text; // Recording | Publishing | CoPub | Distribution | Sync | Other
    parties : Text;  // comma-separated party names
    advanceAmount : Int;
    royaltyRate : Text;
    territory : Text;
    termLength : Text;
    startDate : Text;
    endDate : Text;
    optionPeriods : Text;
    status : Text; // Draft | Negotiation | Executed | Active | Expired | Renewed | Terminated
    notes : Text;
    contractDocUrl : Text;
    createdAt : Int;
    updatedAt : Int;
    createdBy : Principal;
    linkedMembers : [Text];
    linkedArtists : [Text];
  };

  // Request type for creating / updating a deal (no id / audit fields)
  public type CreateDealRequest = {
    title : Text;
    dealType : Text;
    parties : Text;
    advanceAmount : Int;
    royaltyRate : Text;
    territory : Text;
    termLength : Text;
    startDate : Text;
    endDate : Text;
    optionPeriods : Text;
    status : Text;
    notes : Text;
    contractDocUrl : Text;
    linkedMembers : [Text];
    linkedArtists : [Text];
  };
};
