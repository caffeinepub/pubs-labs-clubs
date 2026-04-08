import Map "mo:core/Map";
import Principal "mo:core/Principal";

module {
  public type UserRole = {
    #admin;
    #user;
    #guest;
  };

  public type Permission = {
    #admin;
    #user;
    #guest;
  };

  public type State = {
    roles : Map.Map<Principal, UserRole>;
    controllers : [Principal];
  };

  public func initState() : State {
    {
      roles = Map.empty<Principal, UserRole>();
      controllers = [];
    };
  };

  public func isAdmin(state : State, caller : Principal) : Bool {
    switch (state.roles.get(caller)) {
      case (? #admin) { true };
      case (_) { false };
    };
  };

  public func getUserRole(state : State, caller : Principal) : UserRole {
    switch (state.roles.get(caller)) {
      case (?role) { role };
      case (null) { #guest };
    };
  };

  public func hasPermission(state : State, caller : Principal, permission : Permission) : Bool {
    let role = getUserRole(state, caller);
    switch (permission) {
      case (#admin) {
        role == #admin;
      };
      case (#user) {
        role == #admin or role == #user;
      };
      case (#guest) {
        true;
      };
    };
  };

  public func setRole(state : State, user : Principal, role : UserRole) {
    state.roles.add(user, role);
  };
};
