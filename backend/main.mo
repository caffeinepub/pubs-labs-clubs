import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  type MemberId = Text;
  type PublishingId = Text;
  type LabelEntityId = Text;
  type RecodingId = Text;
  type ArtistDevelopmentId = Text;

  // CHANGE HISTORY
  public type ChangeEvent = {
    id : Nat;
    recordId : Text;
    timestamp : Int;
    changedFields : [Text];
    operationType : { #create; #update; #link };
    author : Principal;
  };

  // RECORD IDENTIFIERS
  public type RecordIdentifier = {
    entityType : { #membership; #publishing; #release; #recordingProject; #artistDevelopment };
    recordId : Text;
  };

  // USER PROFILE
  public type UserProfile = {
    name : Text;
    email : Text;
    bio : Text;
  };

  public type SignedInUser = {
    principal : Principal;
    profile : ?UserProfile;
    role : AccessControl.UserRole;
  };

  // MEMBERSHIP
  module MemberStatus {
    public type T = {
      #applicant;
      #active;
      #paused;
      #inactive;
    };

    public func toText(status : T) : Text {
      switch (status) {
        case (#applicant) { "applicant" };
        case (#active) { "active" };
        case (#paused) { "paused" };
        case (#inactive) { "inactive" };
      };
    };
  };

  public type MembershipTier = {
    name : Text;
    description : Text;
    fee : Nat;
    benefits : [Text];
  };

  public type MembershipProfile = {
    id : MemberId;
    principal : Principal;
    name : Text;
    email : Text;
    status : MemberStatus.T;
    tier : Text;
    notes : Text;
    agreements : [Text];
    created_at : Time.Time;
    updated_at : Time.Time;
  };

  public type Membership = {
    profile : MembershipProfile;
    tier : MembershipTier;
    linkedArtists : [ArtistDevelopmentId];
    linkedWorks : [PublishingId];
    linkedReleases : [LabelEntityId];
    linkedProjects : [RecodingId];
  };

  // PUBLISHING
  public type PublishingWork = {
    id : PublishingId;
    owner : Principal;
    title : Text;
    contributors : [Text];
    ownershipSplits : [(Text, Nat)];
    iswc : ?Text;
    isrc : ?Text;
    registrationStatus : Text;
    notes : Text;
    linkedMembers : [MemberId];
    linkedArtists : [ArtistDevelopmentId];
    linkedReleases : [LabelEntityId];
    linkedProjects : [RecodingId];
    created_at : Time.Time;
  };

  // LABEL MANAGEMENT
  public type Release = {
    id : LabelEntityId;
    owner : Principal;
    title : Text;
    releaseType : Text;
    tracklist : [Text];
    keyDates : [Text];
    owners : [Text];
    workflowChecklist : [Text];
    linkedMembers : [MemberId];
    linkedArtists : [ArtistDevelopmentId];
    linkedWorks : [PublishingId];
    linkedProjects : [RecodingId];
    created_at : Time.Time;
  };

  public type ProjectStatus = {
    #planned;
    #in_progress;
    #completed;
    #archived;
  };

  public type RecordingProject = {
    id : RecodingId;
    owner : Principal;
    title : Text;
    participants : [Text];
    sessionDate : Time.Time;
    status : ProjectStatus;
    notes : Text;
    assetReferences : [Text];
    linkedMembers : [MemberId];
    linkedArtists : [ArtistDevelopmentId];
    linkedWorks : [PublishingId];
    linkedReleases : [LabelEntityId];
    created_at : Time.Time;
  };

  // ARTIST DEVELOPMENT / CRM
  public type ArtistDevelopment = {
    id : ArtistDevelopmentId;
    owner : Principal;
    artistId : Text;
    goals : [Text];
    plans : [Text];
    milestones : [Text];
    internalNotes : Text;
    relatedMemberships : [MemberId];
    relatedPublishing : [PublishingId];
    relatedLabelEntities : [LabelEntityId];
    relatedRecordingProjects : [RecodingId];
    relatedArtistDevelopment : [ArtistDevelopmentId];
    created_at : Time.Time;
  };

  module ArtistDevelopment {
    public type ByGoals = {
      id : ArtistDevelopmentId;
      artistId : Text;
      goals : Text;
      created_at : Time.Time;
    };

    public func compareByGoals(a : ByGoals, b : ByGoals) : Order.Order {
      Text.compare(a.goals, b.goals);
    };
  };

  public type DashboardStats = {
    totalMemberships : Nat;
    totalPublishingWorks : Nat;
    totalReleases : Nat;
    totalRecordingProjects : Nat;
    totalArtistDevelopment : Nat;
    membershipStatusCounts : [(MemberStatus.T, Nat)];
    releaseTypeCounts : [(Text, Nat)];
    projectStatusCounts : [(ProjectStatus, Nat)];
  };

  var nextEntityId = 0;

  // COMPONENT INTEGRATION
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();
  let memberships = Map.empty<MemberId, Membership>();
  let publishingCatalog = Map.empty<Text, PublishingWork>();
  let releases = Map.empty<LabelEntityId, Release>();
  let recordingProjects = Map.empty<RecodingId, RecordingProject>();
  let artistDevelopment = Map.empty<ArtistDevelopmentId, ArtistDevelopment>();
  let knownUsers = Map.empty<Principal, SignedInUser>();
  let changeHistory = Map.empty<Text, [ChangeEvent]>();

  // HISTORY TRACKING FUNCTIONS
  func addChangeEvent(recordId : Text, changedFields : [Text], operationType : { #create; #update; #link }, author : Principal) {
    let timestamp = Time.now();
    let previousEvents = switch (changeHistory.get(recordId)) {
      case (null) { [] };
      case (?events) { events };
    };
    let newChangeEvent = {
      id = previousEvents.size();
      recordId;
      timestamp;
      changedFields;
      operationType;
      author;
    };
    let updatedEvents = previousEvents.concat([newChangeEvent]);
    changeHistory.add(recordId, updatedEvents);
  };

  // Returns change history for a record. Requires the caller to be a user,
  // and to be either the owner of the record or an admin.
  public query ({ caller }) func getChangeHistory(recordId : Text) : async [ChangeEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view change history");
    };

    // Verify the caller owns the record (or is admin) by checking all entity stores.
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    if (not isAdmin) {
      // Check membership ownership
      let membershipOwned = switch (memberships.get(recordId)) {
        case (?m) { m.profile.principal == caller };
        case (null) { false };
      };
      // Check publishing work ownership
      let publishingOwned = switch (publishingCatalog.get(recordId)) {
        case (?w) { w.owner == caller };
        case (null) { false };
      };
      // Check release ownership
      let releaseOwned = switch (releases.get(recordId)) {
        case (?r) { r.owner == caller };
        case (null) { false };
      };
      // Check recording project ownership
      let projectOwned = switch (recordingProjects.get(recordId)) {
        case (?p) { p.owner == caller };
        case (null) { false };
      };
      // Check artist development ownership
      let artistOwned = switch (artistDevelopment.get(recordId)) {
        case (?a) { a.owner == caller };
        case (null) { false };
      };

      if (not (membershipOwned or publishingOwned or releaseOwned or projectOwned or artistOwned)) {
        Runtime.trap("Unauthorized: You can only view change history for your own records");
      };
    };

    switch (changeHistory.get(recordId)) {
      case (null) { [] };
      case (?events) { events };
    };
  };

  func processEntitiesForChangeEvent(recordId : Text, changedFields : [Text], operationType : { #create; #update; #link }, author : Principal) {
    addChangeEvent(recordId, changedFields, operationType, author);
  };

  // MAIN FUNCTIONALITY

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: you can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);

    let role = AccessControl.getUserRole(accessControlState, caller);
    let signedInUser : SignedInUser = {
      principal = caller;
      profile = ?profile;
      role;
    };
    knownUsers.add(caller, signedInUser);
  };

  public shared ({ caller }) func updateKnownUserRole() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update role information");
    };
    let role = AccessControl.getUserRole(accessControlState, caller);
    let existingProfile = userProfiles.get(caller);

    let signedInUser : SignedInUser = {
      principal = caller;
      profile = existingProfile;
      role;
    };
    knownUsers.add(caller, signedInUser);
  };

  public query ({ caller }) func getAllKnownUsers() : async [SignedInUser] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    knownUsers.values().toArray();
  };

  public shared ({ caller }) func createMembershipProfile(
    id : MemberId,
    name : Text,
    email : Text,
  ) : async MembershipProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create membership profiles");
    };
    let now = Time.now();
    let profile : MembershipProfile = {
      id;
      principal = caller;
      name;
      email;
      status = #applicant;
      tier = "Basic";
      notes = "";
      agreements = [];
      created_at = now;
      updated_at = now;
    };
    switch (memberships.get(id)) {
      case (?_) { Runtime.trap("Membership id is already created") };
      case (null) {
        let tier = {
          name = "Basic";
          description = "Default Membership Tier";
          fee = 0;
          benefits = [];
        };
        memberships.add(id, {
          profile;
          tier;
          linkedArtists = [];
          linkedWorks = [];
          linkedReleases = [];
          linkedProjects = [];
        });
        processEntitiesForChangeEvent(id, ["profile"], #create, caller);
        profile;
      };
    };
  };

  public query ({ caller }) func getMembershipProfile(id : MemberId) : async MembershipProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view membership profiles");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership profile not found") };
      case (?membership) {
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own membership profile");
        };
        membership.profile;
      };
    };
  };

  public shared ({ caller }) func updateMembershipProfileFields(
    id : MemberId,
    name : Text,
    email : Text,
  ) : async MembershipProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update memberships");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership profile not found") };
      case (?existingMembership) {
        if (caller != existingMembership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not have permission to update this profile");
        };
        let updatedProfile : MembershipProfile = {
          id;
          principal = existingMembership.profile.principal;
          name;
          email;
          status = existingMembership.profile.status;
          tier = existingMembership.profile.tier;
          notes = existingMembership.profile.notes;
          agreements = existingMembership.profile.agreements;
          created_at = existingMembership.profile.created_at;
          updated_at = Time.now();
        };
        let updatedMembership : Membership = {
          profile = updatedProfile;
          tier = existingMembership.tier;
          linkedArtists = existingMembership.linkedArtists;
          linkedWorks = existingMembership.linkedWorks;
          linkedReleases = existingMembership.linkedReleases;
          linkedProjects = existingMembership.linkedProjects;
        };
        memberships.add(id, updatedMembership);
        processEntitiesForChangeEvent(id, ["profile"], #update, caller);
        updatedProfile;
      };
    };
  };

  public shared ({ caller }) func updateMembership(
    id : MemberId,
    name : Text,
    email : Text,
    status : MemberStatus.T,
  ) : async MembershipProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update memberships");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership profile not found") };
      case (?existingMembership) {
        if (caller != existingMembership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You do not have permission to update this membership");
        };
        let resolvedStatus = if (AccessControl.isAdmin(accessControlState, caller)) {
          status;
        } else {
          existingMembership.profile.status;
        };
        let updatedProfile : MembershipProfile = {
          id;
          principal = existingMembership.profile.principal;
          name;
          email;
          status = resolvedStatus;
          tier = existingMembership.profile.tier;
          notes = existingMembership.profile.notes;
          agreements = existingMembership.profile.agreements;
          created_at = existingMembership.profile.created_at;
          updated_at = Time.now();
        };
        let updatedMembership : Membership = {
          profile = updatedProfile;
          tier = existingMembership.tier;
          linkedArtists = existingMembership.linkedArtists;
          linkedWorks = existingMembership.linkedWorks;
          linkedReleases = existingMembership.linkedReleases;
          linkedProjects = existingMembership.linkedProjects;
        };
        memberships.add(id, updatedMembership);
        processEntitiesForChangeEvent(id, ["profile"], #update, caller);
        updatedProfile;
      };
    };
  };

  public shared ({ caller }) func updateMembershipStatus(
    id : MemberId,
    status : MemberStatus.T,
  ) : async MembershipProfile {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can change membership status");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership profile not found") };
      case (?existingMembership) {
        let updatedProfile : MembershipProfile = {
          id;
          principal = existingMembership.profile.principal;
          name = existingMembership.profile.name;
          email = existingMembership.profile.email;
          status;
          tier = existingMembership.profile.tier;
          notes = existingMembership.profile.notes;
          agreements = existingMembership.profile.agreements;
          created_at = existingMembership.profile.created_at;
          updated_at = Time.now();
        };
        let updatedMembership : Membership = {
          profile = updatedProfile;
          tier = existingMembership.tier;
          linkedArtists = existingMembership.linkedArtists;
          linkedWorks = existingMembership.linkedWorks;
          linkedReleases = existingMembership.linkedReleases;
          linkedProjects = existingMembership.linkedProjects;
        };
        memberships.add(id, updatedMembership);
        processEntitiesForChangeEvent(id, ["profile"], #update, caller);
        updatedProfile;
      };
    };
  };

  public shared ({ caller }) func updateMembershipLinks(
    id : MemberId,
    artistIds : [ArtistDevelopmentId],
    workIds : [PublishingId],
    releaseIds : [LabelEntityId],
    projectIds : [RecodingId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update relationships");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own relationships");
        };

        memberships.add(id, {
          membership with
          linkedArtists = artistIds;
          linkedWorks = workIds;
          linkedReleases = releaseIds;
          linkedProjects = projectIds;
        });
      };
    };
  };

  public query ({ caller }) func getMembershipDetails(id : MemberId) : async Membership {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view membership details");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own membership record");
        };
        membership;
      };
    };
  };

  public query ({ caller }) func getCallerMemberships() : async [Membership] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view memberships");
    };
    memberships.values().toArray().filter(func(m) { m.profile.principal == caller });
  };

  public shared ({ caller }) func duplicateMembership(id : MemberId) : async Membership {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate memberships");
    };

    let original = switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own memberships");
        };
        membership;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newProfile : MembershipProfile = {
      original.profile with
      id = newId;
      name = "Copy of " # original.profile.name;
      created_at = Time.now();
      updated_at = Time.now();
    };

    let newMembership : Membership = {
      original with
      profile = newProfile;
    };

    memberships.add(newId, newMembership);
    newMembership;
  };

  public query ({ caller }) func getAllMembershipProfiles() : async [MembershipProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all membership profiles");
    };
    memberships.values().toArray().map(func(entry) { entry.profile });
  };

  public query ({ caller }) func getMembershipProfilesByStatus(status : MemberStatus.T) : async [MembershipProfile] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can filter membership profiles");
    };
    let filtered = memberships.toArray().filter(func((_, membership)) { membership.profile.status == status });
    filtered.map(func((_, membership)) { membership.profile });
  };

  public shared ({ caller }) func bulkDeleteMembershipProfiles(ids : [MemberId]) : async {
    deleted : [MemberId];
    failed : [MemberId];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete membership profiles");
    };
    var deletedMemberships : [MemberId] = [];
    var failedMemberships : [MemberId] = [];
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    func processId(id : MemberId) : () {
      switch (memberships.get(id)) {
        case (null) {
          failedMemberships := failedMemberships.concat([id]);
        };
        case (?membership) {
          if (isAdmin or caller == membership.profile.principal) {
            memberships.remove(id);
            deletedMemberships := deletedMemberships.concat([id]);
          } else {
            failedMemberships := failedMemberships.concat([id]);
          };
        };
      };
    };

    for (id in ids.values()) { processId(id) };
    {
      deleted = deletedMemberships;
      failed = failedMemberships;
    };
  };

  public query ({ caller }) func getDashboardStats() : async DashboardStats {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view dashboard stats");
    };

    let totalMemberships = memberships.size();
    let totalPublishingWorks = publishingCatalog.size();
    let totalReleases = releases.size();
    let totalRecordingProjects = recordingProjects.size();
    let totalArtistDevelopment = artistDevelopment.size();

    let membershipStatusCounts = [
      (#applicant, 0),
      (#active, 0),
      (#paused, 0),
      (#inactive, 0),
    ];

    let releaseTypes = ["LP", "EP", "Single"];

    let projectStatusCounts = [
      (#planned, 0),
      (#in_progress, 0),
      (#completed, 0),
      (#archived, 0),
    ];

    {
      totalMemberships;
      totalPublishingWorks;
      totalReleases;
      totalRecordingProjects;
      totalArtistDevelopment;
      membershipStatusCounts;
      releaseTypeCounts = releaseTypes.map(func(rt) { (rt, 0) });
      projectStatusCounts;
    };
  };

  // GETTING REMAINING ROLLOUT STEPS (DEVELOPER TOOL)
  public shared ({ caller }) func getRemainingRolloutSteps() : async [(Text, Text)] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: only admins can view rollout steps");
    };

    [
      ("Step 9: Deployment and Launch", "Deploy system to the ICP mainnet, monitor performance and user adoption. Perform additional system configuration as needed. Perform final quality assurance checks."),
      ("Step 10: Post-Launch Refinements", "Incorporate user feedback to improve UX and performance. Fix remaining bugs and issues. Integrate CI/CD pipeline."),
      ("Step 12: Long Term Maintenance", "Plan and implement system maintenance procedures. Add improvements as needed. Train core team on system maintenance. Maintain documentations and change logs."),
    ];
  };

  // ==== MISSING ADMINISTRATION FUNCTIONS ======

  // Approval query for the specific caller
  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  // User-initiated approval request
  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  // Get complete list of all approvals. Only for admins.
  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

};
