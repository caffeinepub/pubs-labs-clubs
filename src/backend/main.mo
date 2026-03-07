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

  public type MemberId = Text;
  public type PublishingId = Text;
  public type LabelEntityId = Text;
  public type RecodingId = Text;
  public type ArtistDevelopmentId = Text;

  public type CreateArtistDevelopmentRequest = {
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
  };

  public type CreateArtistDevelopmentResponse = {
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

  public type CreatePublishingWorkRequest = {
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
  };

  public type CreateReleaseRequest = {
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
  };

  public type CreateRecordingProjectRequest = {
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
  };

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
  let publishingCatalog = Map.empty<PublishingId, PublishingWork>();
  let releases = Map.empty<LabelEntityId, Release>();
  let recordingProjects = Map.empty<RecodingId, RecordingProject>();
  let artistDevelopment = Map.empty<ArtistDevelopmentId, ArtistDevelopment>();
  let knownUsers = Map.empty<Principal, SignedInUser>();
  let changeHistory = Map.empty<Text, [ChangeEvent]>();

  // COMMENTS & NOTES SYSTEM
  public type Comment = {
    id : Nat;
    recordId : Text;
    author : Principal;
    text : Text;
    createdAt : Time.Time;
  };

  let comments = Map.empty<Text, [Comment]>();

  public shared ({ caller }) func addComment(recordId : Text, text : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add comments");
    };

    let existingComments = switch (comments.get(recordId)) {
      case (null) { [] };
      case (?c) { c };
    };
    let newCommentId = existingComments.size();

    let newComment : Comment = {
      id = newCommentId;
      recordId;
      author = caller;
      text;
      createdAt = Time.now();
    };

    let updatedComments = existingComments.concat([newComment]);
    comments.add(recordId, updatedComments);
    newComment;
  };

  public query ({ caller }) func getComments(recordId : Text) : async [Comment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view comments");
    };

    switch (comments.get(recordId)) {
      case (null) { [] };
      case (?c) { c };
    };
  };

  public shared ({ caller }) func deleteComment(recordId : Text, commentId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    switch (comments.get(recordId)) {
      case (null) { Runtime.trap("Record not found") };
      case (?existingComments) {
        // Find the comment with the specified ID
        let commentToDelete = existingComments.filter(func(c) { c.id == commentId });
        
        if (commentToDelete.size() == 0) {
          Runtime.trap("Comment not found");
        };

        // Check authorization: only the comment author or admin can delete
        if (commentToDelete[0].author != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the comment author or admin can delete this comment");
        };

        // Remove the comment
        let filteredComments = existingComments.filter(func(c) { c.id != commentId });
        comments.add(recordId, filteredComments);
      };
    };
  };

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

  public query ({ caller }) func getChangeHistory(recordId : Text) : async [ChangeEvent] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view change history");
    };

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
    processEntitiesForChangeEvent(newId, ["profile"], #create, caller);
    newMembership;
  };

  public shared ({ caller }) func deleteMembership(id : MemberId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete memberships");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        if (membership.profile.principal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own memberships");
        };
        memberships.remove(id);
      };
    };
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

  // ==========================
  // PUBLISHING WORK FUNCTIONS
  // ==========================
  public shared ({ caller }) func createPublishingWork(request : CreatePublishingWorkRequest) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create publishing works");
    };

    nextEntityId += 1;
    let id = nextEntityId.toText();
    let now = Time.now();

    let newWork : PublishingWork = {
      id;
      owner = caller;
      title = request.title;
      contributors = request.contributors;
      ownershipSplits = request.ownershipSplits;
      iswc = request.iswc;
      isrc = request.isrc;
      registrationStatus = request.registrationStatus;
      notes = request.notes;
      linkedMembers = request.linkedMembers;
      linkedArtists = request.linkedArtists;
      linkedReleases = request.linkedReleases;
      linkedProjects = request.linkedProjects;
      created_at = now;
    };

    publishingCatalog.add(id, newWork);
    processEntitiesForChangeEvent(id, ["title", "contributors", "ownershipSplits"], #create, caller);
    newWork;
  };

  public query ({ caller }) func getPublishingWork(id : PublishingId) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishing works");
    };
    switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (work.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own publishing works");
        };
        work;
      };
    };
  };

  public query ({ caller }) func getCallerPublishingWorks() : async [PublishingWork] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishing works");
    };
    publishingCatalog.values().toArray().filter(func(w) { w.owner == caller });
  };

  public query ({ caller }) func getAllPublishingWorks() : async [PublishingWork] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all publishing works");
    };
    publishingCatalog.values().toArray();
  };

  public shared ({ caller }) func updatePublishingWork(
    id : PublishingId,
    request : CreatePublishingWorkRequest,
  ) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update publishing works");
    };
    switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own publishing works");
        };
        let updated : PublishingWork = {
          id;
          owner = existing.owner;
          title = request.title;
          contributors = request.contributors;
          ownershipSplits = request.ownershipSplits;
          iswc = request.iswc;
          isrc = request.isrc;
          registrationStatus = request.registrationStatus;
          notes = request.notes;
          linkedMembers = request.linkedMembers;
          linkedArtists = request.linkedArtists;
          linkedReleases = request.linkedReleases;
          linkedProjects = request.linkedProjects;
          created_at = existing.created_at;
        };
        publishingCatalog.add(id, updated);
        processEntitiesForChangeEvent(id, ["title", "contributors", "ownershipSplits", "notes"], #update, caller);
        updated;
      };
    };
  };

  public shared ({ caller }) func deletePublishingWork(id : PublishingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete publishing works");
    };
    switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (work.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own publishing works");
        };
        publishingCatalog.remove(id);
      };
    };
  };

  public shared ({ caller }) func duplicatePublishingWork(id : PublishingId) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate publishing works");
    };

    let original = switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (work.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own publishing works");
        };
        work;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newWork : PublishingWork = {
      original with
      id = newId;
      owner = caller;
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    publishingCatalog.add(newId, newWork);
    processEntitiesForChangeEvent(newId, ["title"], #create, caller);
    newWork;
  };

  // =================
  // RELEASE FUNCTIONS
  // =================

  public shared ({ caller }) func createRelease(request : CreateReleaseRequest) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create releases");
    };

    nextEntityId += 1;
    let id = nextEntityId.toText();
    let now = Time.now();

    let newRelease : Release = {
      id;
      owner = caller;
      title = request.title;
      releaseType = request.releaseType;
      tracklist = request.tracklist;
      keyDates = request.keyDates;
      owners = request.owners;
      workflowChecklist = request.workflowChecklist;
      linkedMembers = request.linkedMembers;
      linkedArtists = request.linkedArtists;
      linkedWorks = request.linkedWorks;
      linkedProjects = request.linkedProjects;
      created_at = now;
    };

    releases.add(id, newRelease);
    processEntitiesForChangeEvent(id, ["title", "releaseType", "tracklist"], #create, caller);
    newRelease;
  };

  public query ({ caller }) func getRelease(id : LabelEntityId) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view releases");
    };
    switch (releases.get(id)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (release.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own releases");
        };
        release;
      };
    };
  };

  public query ({ caller }) func getCallerReleases() : async [Release] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view releases");
    };
    releases.values().toArray().filter(func(r) { r.owner == caller });
  };

  public query ({ caller }) func getAllReleases() : async [Release] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all releases");
    };
    releases.values().toArray();
  };

  public shared ({ caller }) func updateRelease(
    id : LabelEntityId,
    request : CreateReleaseRequest,
  ) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update releases");
    };
    switch (releases.get(id)) {
      case (null) { Runtime.trap("Release not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own releases");
        };
        let updated : Release = {
          id;
          owner = existing.owner;
          title = request.title;
          releaseType = request.releaseType;
          tracklist = request.tracklist;
          keyDates = request.keyDates;
          owners = request.owners;
          workflowChecklist = request.workflowChecklist;
          linkedMembers = request.linkedMembers;
          linkedArtists = request.linkedArtists;
          linkedWorks = request.linkedWorks;
          linkedProjects = request.linkedProjects;
          created_at = existing.created_at;
        };
        releases.add(id, updated);
        processEntitiesForChangeEvent(id, ["title", "releaseType", "tracklist", "keyDates"], #update, caller);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteRelease(id : LabelEntityId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete releases");
    };
    switch (releases.get(id)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (release.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own releases");
        };
        releases.remove(id);
      };
    };
  };

  public shared ({ caller }) func duplicateRelease(id : LabelEntityId) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate releases");
    };

    let original = switch (releases.get(id)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (release.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own releases");
        };
        release;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newRelease : Release = {
      original with
      id = newId;
      owner = caller;
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    releases.add(newId, newRelease);
    processEntitiesForChangeEvent(newId, ["title"], #create, caller);
    newRelease;
  };

  // ============================
  // RECORDING PROJECT FUNCTIONS
  // ============================
  public shared ({ caller }) func createRecordingProject(request : CreateRecordingProjectRequest) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create recording projects");
    };

    nextEntityId += 1;
    let id = nextEntityId.toText();
    let now = Time.now();

    let newProject : RecordingProject = {
      id;
      owner = caller;
      title = request.title;
      participants = request.participants;
      sessionDate = request.sessionDate;
      status = request.status;
      notes = request.notes;
      assetReferences = request.assetReferences;
      linkedMembers = request.linkedMembers;
      linkedArtists = request.linkedArtists;
      linkedWorks = request.linkedWorks;
      linkedReleases = request.linkedReleases;
      created_at = now;
    };

    recordingProjects.add(id, newProject);
    processEntitiesForChangeEvent(id, ["title", "participants", "status"], #create, caller);
    newProject;
  };

  public query ({ caller }) func getRecordingProject(id : RecodingId) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recording projects");
    };
    switch (recordingProjects.get(id)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own recording projects");
        };
        project;
      };
    };
  };

  public query ({ caller }) func getCallerRecordingProjects() : async [RecordingProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recording projects");
    };
    recordingProjects.values().toArray().filter(func(p) { p.owner == caller });
  };

  public query ({ caller }) func getAllRecordingProjects() : async [RecordingProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all recording projects");
    };
    recordingProjects.values().toArray();
  };

  public shared ({ caller }) func updateRecordingProject(
    id : RecodingId,
    request : CreateRecordingProjectRequest,
  ) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update recording projects");
    };
    switch (recordingProjects.get(id)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own recording projects");
        };
        let updated : RecordingProject = {
          id;
          owner = existing.owner;
          title = request.title;
          participants = request.participants;
          sessionDate = request.sessionDate;
          status = request.status;
          notes = request.notes;
          assetReferences = request.assetReferences;
          linkedMembers = request.linkedMembers;
          linkedArtists = request.linkedArtists;
          linkedWorks = request.linkedWorks;
          linkedReleases = request.linkedReleases;
          created_at = existing.created_at;
        };
        recordingProjects.add(id, updated);
        processEntitiesForChangeEvent(id, ["title", "participants", "status", "notes"], #update, caller);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteRecordingProject(id : RecodingId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete recording projects");
    };
    switch (recordingProjects.get(id)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own recording projects");
        };
        recordingProjects.remove(id);
      };
    };
  };

  public shared ({ caller }) func duplicateRecordingProject(id : RecodingId) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate recording projects");
    };

    let original = switch (recordingProjects.get(id)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (project.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own recording projects");
        };
        project;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newProject : RecordingProject = {
      original with
      id = newId;
      owner = caller;
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    recordingProjects.add(newId, newProject);
    processEntitiesForChangeEvent(newId, ["title"], #create, caller);
    newProject;
  };

  // ==============================
  // ARTIST DEVELOPMENT FUNCTIONS
  // ==============================
  public shared ({ caller }) func createArtistDevelopment(request : CreateArtistDevelopmentRequest) : async CreateArtistDevelopmentResponse {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create artist development records");
    };

    let now = Time.now();
    nextEntityId += 1;
    let id = nextEntityId.toText();

    let newArtistDevelopment : ArtistDevelopment = {
      id;
      owner = caller;
      artistId = request.artistId;
      goals = request.goals;
      plans = request.plans;
      milestones = request.milestones;
      internalNotes = request.internalNotes;
      relatedMemberships = request.relatedMemberships;
      relatedPublishing = request.relatedPublishing;
      relatedLabelEntities = request.relatedLabelEntities;
      relatedRecordingProjects = request.relatedRecordingProjects;
      relatedArtistDevelopment = request.relatedArtistDevelopment;
      created_at = now;
    };

    artistDevelopment.add(id, newArtistDevelopment);
    processEntitiesForChangeEvent(id, ["artistId", "goals", "plans", "milestones"], #create, caller);

    let response : CreateArtistDevelopmentResponse = {
      id = newArtistDevelopment.id;
      owner = newArtistDevelopment.owner;
      artistId = newArtistDevelopment.artistId;
      goals = newArtistDevelopment.goals;
      plans = newArtistDevelopment.plans;
      milestones = newArtistDevelopment.milestones;
      internalNotes = newArtistDevelopment.internalNotes;
      relatedMemberships = newArtistDevelopment.relatedMemberships;
      relatedPublishing = newArtistDevelopment.relatedPublishing;
      relatedLabelEntities = newArtistDevelopment.relatedLabelEntities;
      relatedRecordingProjects = newArtistDevelopment.relatedRecordingProjects;
      relatedArtistDevelopment = newArtistDevelopment.relatedArtistDevelopment;
      created_at = newArtistDevelopment.created_at;
    };

    response;
  };

  public query ({ caller }) func getArtistDevelopment(id : ArtistDevelopmentId) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view artist development records");
    };
    switch (artistDevelopment.get(id)) {
      case (null) { Runtime.trap("Artist development record not found") };
      case (?record) {
        if (record.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only view your own artist development records");
        };
        record;
      };
    };
  };

  public query ({ caller }) func getCallerArtistDevelopments() : async [ArtistDevelopment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view artist development records");
    };
    artistDevelopment.values().toArray().filter(func(a) { a.owner == caller });
  };

  public query ({ caller }) func getAllArtistDevelopments() : async [ArtistDevelopment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all artist development records");
    };
    artistDevelopment.values().toArray();
  };

  public shared ({ caller }) func updateArtistDevelopment(
    id : ArtistDevelopmentId,
    request : CreateArtistDevelopmentRequest,
  ) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update artist development records");
    };
    switch (artistDevelopment.get(id)) {
      case (null) { Runtime.trap("Artist development record not found") };
      case (?existing) {
        if (existing.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own artist development records");
        };
        let updated : ArtistDevelopment = {
          id;
          owner = existing.owner;
          artistId = request.artistId;
          goals = request.goals;
          plans = request.plans;
          milestones = request.milestones;
          internalNotes = request.internalNotes;
          relatedMemberships = request.relatedMemberships;
          relatedPublishing = request.relatedPublishing;
          relatedLabelEntities = request.relatedLabelEntities;
          relatedRecordingProjects = request.relatedRecordingProjects;
          relatedArtistDevelopment = request.relatedArtistDevelopment;
          created_at = existing.created_at;
        };
        artistDevelopment.add(id, updated);
        processEntitiesForChangeEvent(id, ["artistId", "goals", "plans", "milestones", "internalNotes"], #update, caller);
        updated;
      };
    };
  };

  public shared ({ caller }) func deleteArtistDevelopment(id : ArtistDevelopmentId) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete artist development records");
    };
    switch (artistDevelopment.get(id)) {
      case (null) { Runtime.trap("Artist development record not found") };
      case (?record) {
        if (record.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only delete your own artist development records");
        };
        artistDevelopment.remove(id);
      };
    };
  };

  public shared ({ caller }) func duplicateArtistDevelopment(id : ArtistDevelopmentId) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate artist development records");
    };

    let original = switch (artistDevelopment.get(id)) {
      case (null) { Runtime.trap("Artist development record not found") };
      case (?record) {
        if (record.owner != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own artist development records");
        };
        record;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newRecord : ArtistDevelopment = {
      original with
      id = newId;
      owner = caller;
      artistId = "Copy of " # original.artistId;
      created_at = Time.now();
    };

    artistDevelopment.add(newId, newRecord);
    processEntitiesForChangeEvent(newId, ["artistId"], #create, caller);
    newRecord;
  };

  // ==================
  // DASHBOARD STATS
  // ==================
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
