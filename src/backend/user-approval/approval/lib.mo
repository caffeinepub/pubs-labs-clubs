import AccessControl "../authorization/access-control/lib";
import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type ApprovalStatus = {
    #approved;
    #pending;
    #rejected;
  };

  public type UserApprovalInfo = {
    user : Principal;
    status : ApprovalStatus;
  };

  public type State = {
    approvals : Map.Map<Principal, ApprovalStatus>;
    accessControlState : AccessControl.State;
  };

  public func initState(accessControlState : AccessControl.State) : State {
    {
      approvals = Map.empty<Principal, ApprovalStatus>();
      accessControlState;
    };
  };

  public func isApproved(state : State, caller : Principal) : Bool {
    switch (state.approvals.get(caller)) {
      case (? #approved) { true };
      case (_) { false };
    };
  };

  public func requestApproval(state : State, caller : Principal) {
    switch (state.approvals.get(caller)) {
      case (null) {
        state.approvals.add(caller, #pending);
      };
      case (_) { };
    };
  };

  public func setApproval(state : State, user : Principal, status : ApprovalStatus) {
    state.approvals.add(user, status);
    if (status == #approved) {
      AccessControl.setRole(state.accessControlState, user, #user);
    };
  };

  public func listApprovals(state : State) : [UserApprovalInfo] {
    state.approvals.toArray().map(func((user, status)) : UserApprovalInfo {
      { user; status };
    });
  };
};
