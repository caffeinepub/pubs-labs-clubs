import AccessControl "./access-control/lib";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";

module {
  public func Mixin(state : AccessControl.State) : {
    bootstrap : (caller : Principal) -> ();
    isCallerAdmin : (caller : Principal) -> Bool;
    getCallerUserRole : (caller : Principal) -> AccessControl.UserRole;
    assignCallerUserRole : (caller : Principal, user : Principal, role : AccessControl.UserRole) -> ();
  } {
    {
      bootstrap = func(caller : Principal) {
        if (state.roles.size() == 0) {
          state.roles.add(caller, #admin);
        } else {
          Runtime.trap("Already bootstrapped");
        };
      };

      isCallerAdmin = func(caller : Principal) : Bool {
        AccessControl.isAdmin(state, caller);
      };

      getCallerUserRole = func(caller : Principal) : AccessControl.UserRole {
        AccessControl.getUserRole(state, caller);
      };

      assignCallerUserRole = func(caller : Principal, user : Principal, role : AccessControl.UserRole) {
        if (not AccessControl.isAdmin(state, caller)) {
          Runtime.trap("Unauthorized: Only admins can assign roles");
        };
        AccessControl.setRole(state, user, role);
      };
    };
  };
};
