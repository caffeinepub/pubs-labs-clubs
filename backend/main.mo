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

  public shared ({ caller }) func duplicatePublishingWork(id : PublishingId) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate publishing works");
    };

    let original = switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own works");
        };
        work;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newWork : PublishingWork = {
      original with
      id = newId;
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    publishingCatalog.add(newId, newWork);
    newWork;
  };

  public shared ({ caller }) func duplicateRelease(id : LabelEntityId) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate releases");
    };

    let original = switch (releases.get(id)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
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
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    releases.add(newId, newRelease);
    newRelease;
  };

  public shared ({ caller }) func duplicateRecordingProject(id : RecodingId) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate recording projects");
    };

    let original = switch (recordingProjects.get(id)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (caller != project.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own projects");
        };
        project;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newProject : RecordingProject = {
      original with
      id = newId;
      title = "Copy of " # original.title;
      created_at = Time.now();
    };

    recordingProjects.add(newId, newProject);
    newProject;
  };

  public shared ({ caller }) func duplicateArtistDevelopment(id : ArtistDevelopmentId) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can duplicate artist development entries");
    };

    let original = switch (artistDevelopment.get(id)) {
      case (null) { Runtime.trap("Artist development entry not found") };
      case (?entry) {
        if (caller != entry.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only duplicate your own entries");
        };
        entry;
      };
    };

    nextEntityId += 1;
    let newId = nextEntityId.toText();

    let newEntry : ArtistDevelopment = {
      original with
      id = newId;
      artistId = "Copy of " # original.artistId;
      created_at = Time.now();
    };

    artistDevelopment.add(newId, newEntry);
    newEntry;
  };

  public shared ({ caller }) func createPublishingWork(
    title : Text,
    contributors : [Text],
    ownershipSplits : [(Text, Nat)],
    iswc : ?Text,
    isrc : ?Text,
    registrationStatus : Text,
  ) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create publishing work");
    };

    nextEntityId += 1;
    let workId = nextEntityId.toText();
    let now = Time.now();
    let work : PublishingWork = {
      id = workId;
      owner = caller;
      title;
      contributors;
      ownershipSplits;
      iswc;
      isrc;
      registrationStatus;
      notes = "";
      linkedMembers = [];
      linkedArtists = [];
      linkedReleases = [];
      linkedProjects = [];
      created_at = now;
    };
    publishingCatalog.add(workId, work);
    processEntitiesForChangeEvent(workId, ["title", "contributors", "ownershipSplits", "iswc", "isrc", "registrationStatus", "notes"], #create, caller);
    work;
  };

  public query ({ caller }) func getPublishingWork(
    id : Text,
  ) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view publishing work");
    };
    switch (publishingCatalog.get(id)) {
      case (null) {
        Runtime.trap("Publishing work not found");
      };
      case (?work) {
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own publishing work");
        };
        work;
      };
    };
  };

  public shared ({ caller }) func updatePublishingWork(
    id : Text,
    title : Text,
    registrationStatus : Text,
    contributors : [Text],
    ownershipSplits : [(Text, Nat)],
    notes : Text,
  ) : async PublishingWork {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update publishing work");
    };
    switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own publishing work");
        };
        let updatedWork : PublishingWork = {
          id = work.id;
          owner = work.owner;
          title;
          contributors;
          ownershipSplits;
          iswc = work.iswc;
          isrc = work.isrc;
          registrationStatus;
          notes;
          linkedMembers = work.linkedMembers;
          linkedArtists = work.linkedArtists;
          linkedReleases = work.linkedReleases;
          linkedProjects = work.linkedProjects;
          created_at = work.created_at;
        };
        publishingCatalog.add(id, updatedWork);
        processEntitiesForChangeEvent(id, ["title", "registrationStatus", "contributors", "ownershipSplits", "notes"], #update, caller);
        updatedWork;
      };
    };
  };

  public shared ({ caller }) func addPublishingWorkNotes(id : Text, notes : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add notes");
    };
    switch (publishingCatalog.get(id)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own publishing work");
        };
        publishingCatalog.add(id, {
          work with notes;
        });
      };
    };
  };

  public shared ({ caller }) func createRelease(title : Text, releaseType : Text, tracklist : [Text], keyDates : [Text], owners : [Text]) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create releases");
    };

    nextEntityId += 1;
    let releaseId = nextEntityId.toText();
    let release : Release = {
      id = releaseId;
      owner = caller;
      title;
      releaseType;
      tracklist;
      keyDates;
      owners;
      workflowChecklist = [];
      linkedMembers = [];
      linkedArtists = [];
      linkedWorks = [];
      linkedProjects = [];
      created_at = Time.now();
    };
    releases.add(releaseId, release);
    processEntitiesForChangeEvent(releaseId, ["title", "releaseType", "tracklist", "keyDates", "owners", "workflowChecklist"], #create, caller);
    release;
  };

  public query ({ caller }) func getRelease(releaseId : LabelEntityId) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view releases");
    };
    switch (releases.get(releaseId)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own releases");
        };
        release;
      };
    };
  };

  public shared ({ caller }) func updateRelease(
    releaseId : LabelEntityId,
    title : Text,
    releaseType : Text,
    tracklist : [Text],
    keyDates : [Text],
    workflowChecklist : [Text],
  ) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update releases");
    };
    switch (releases.get(releaseId)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own releases");
        };
        let updatedRelease : Release = {
          id = release.id;
          owner = release.owner;
          title;
          releaseType;
          tracklist;
          keyDates;
          owners = release.owners;
          workflowChecklist;
          linkedMembers = release.linkedMembers;
          linkedArtists = release.linkedArtists;
          linkedWorks = release.linkedWorks;
          linkedProjects = release.linkedProjects;
          created_at = release.created_at;
        };
        releases.add(releaseId, updatedRelease);
        processEntitiesForChangeEvent(releaseId, ["title", "releaseType", "tracklist", "keyDates", "workflowChecklist"], #update, caller);
        updatedRelease;
      };
    };
  };

  public shared ({ caller }) func assignReleaseOwners(releaseId : LabelEntityId, owners : [Text]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can assign release owners");
    };

    switch (releases.get(releaseId)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own releases");
        };
        releases.add(releaseId, { release with owners });
      };
    };
  };

  public shared ({ caller }) func createRecordingProject(
    title : Text,
    participants : [Text],
    sessionDate : Time.Time,
    status : ProjectStatus,
    notes : Text,
  ) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create recording projects");
    };

    nextEntityId += 1;
    let projectId = nextEntityId.toText();
    let project : RecordingProject = {
      id = projectId;
      owner = caller;
      title;
      participants;
      sessionDate;
      status;
      notes;
      assetReferences = [];
      linkedMembers = [];
      linkedArtists = [];
      linkedWorks = [];
      linkedReleases = [];
      created_at = Time.now();
    };
    recordingProjects.add(projectId, project);
    processEntitiesForChangeEvent(projectId, ["title", "participants", "sessionDate", "status", "notes", "assetReferences"], #create, caller);
    project;
  };

  public query ({ caller }) func getRecordingProject(projectId : RecodingId) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recording projects");
    };
    switch (recordingProjects.get(projectId)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (caller != project.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own recording projects");
        };
        project;
      };
    };
  };

  public shared ({ caller }) func updateRecordingProject(
    projectId : RecodingId,
    title : Text,
    participants : [Text],
    sessionDate : Time.Time,
    status : ProjectStatus,
    notes : Text,
  ) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update recording projects");
    };
    switch (recordingProjects.get(projectId)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (caller != project.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own recording projects");
        };
        let updatedProject : RecordingProject = {
          id = project.id;
          owner = project.owner;
          title;
          participants;
          sessionDate;
          status;
          notes;
          assetReferences = project.assetReferences;
          linkedMembers = project.linkedMembers;
          linkedArtists = project.linkedArtists;
          linkedWorks = project.linkedWorks;
          linkedReleases = project.linkedReleases;
          created_at = project.created_at;
        };
        recordingProjects.add(projectId, updatedProject);
        processEntitiesForChangeEvent(projectId, ["participants", "sessionDate", "status", "notes"], #update, caller);
        updatedProject;
      };
    };
  };

  public shared ({ caller }) func createArtistDevelopment(
    artistId : Text,
    goals : [Text],
    plans : [Text],
    milestones : [Text],
    internalNotes : Text,
  ) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create artist development entries");
    };
    nextEntityId += 1;
    let entryId = nextEntityId.toText();
    let entry : ArtistDevelopment = {
      id = entryId;
      owner = caller;
      artistId;
      goals;
      plans;
      milestones;
      internalNotes;
      relatedMemberships = [];
      relatedPublishing = [];
      relatedLabelEntities = [];
      relatedRecordingProjects = [];
      relatedArtistDevelopment = [];
      created_at = Time.now();
    };

    artistDevelopment.add(entryId, entry);
    processEntitiesForChangeEvent(entryId, ["artistId", "goals", "plans", "milestones", "internalNotes", "relatedMemberships", "relatedPublishing", "relatedLabelEntities", "relatedRecordingProjects", "relatedArtistDevelopment"], #create, caller);
    entry;
  };

  public query ({ caller }) func getArtistDevelopment(entryId : ArtistDevelopmentId) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view artist development entries");
    };
    switch (artistDevelopment.get(entryId)) {
      case (null) { Runtime.trap("Artist development entry not found") };
      case (?entry) {
        if (caller != entry.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own artist development entries");
        };
        entry;
      };
    };
  };

  public shared ({ caller }) func updateArtistDevelopment(
    entryId : ArtistDevelopmentId,
    goals : [Text],
    plans : [Text],
    milestones : [Text],
    internalNotes : Text,
  ) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update artist development entries");
    };
    switch (artistDevelopment.get(entryId)) {
      case (null) { Runtime.trap("Artist development entry not found") };
      case (?entry) {
        if (caller != entry.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own artist development entries");
        };
        let updatedEntry : ArtistDevelopment = {
          id = entry.id;
          owner = entry.owner;
          artistId = entry.artistId;
          goals;
          plans;
          milestones;
          internalNotes;
          relatedMemberships = entry.relatedMemberships;
          relatedPublishing = entry.relatedPublishing;
          relatedLabelEntities = entry.relatedLabelEntities;
          relatedRecordingProjects = entry.relatedRecordingProjects;
          relatedArtistDevelopment = entry.relatedArtistDevelopment;
          created_at = entry.created_at;
        };
        artistDevelopment.add(entryId, updatedEntry);
        processEntitiesForChangeEvent(entryId, ["goals", "plans", "milestones", "internalNotes"], #update, caller);
        updatedEntry;
      };
    };
  };

  public shared ({ caller }) func updateArtistDevelopmentLinks(
    artistDevelopmentId : ArtistDevelopmentId,
    relatedMemberships : [MemberId],
    relatedPublishing : [PublishingId],
    relatedLabelEntities : [LabelEntityId],
    relatedRecordingProjects : [RecodingId],
    relatedArtistDevelopment : [ArtistDevelopmentId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update artist development links");
    };

    switch (artistDevelopment.get(artistDevelopmentId)) {
      case (null) { Runtime.trap("Artist development record not found") };
      case (?record) {
        if (caller != record.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own artist development records");
        };
        let updatedRecord = {
          record with
          relatedMemberships;
          relatedPublishing;
          relatedLabelEntities;
          relatedRecordingProjects;
          relatedArtistDevelopment;
        };
        artistDevelopment.add(artistDevelopmentId, updatedRecord);
      };
    };
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

  public shared ({ caller }) func bulkDeletePublishingWorks(ids : [PublishingId]) : async {
    deleted : [PublishingId];
    failed : [PublishingId];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete publishing works");
    };
    var deletedWorks : [PublishingId] = [];
    var failedWorks : [PublishingId] = [];
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    func processId(id : PublishingId) : () {
      switch (publishingCatalog.get(id)) {
        case (null) {
          failedWorks := failedWorks.concat([id]);
        };
        case (?work) {
          if (isAdmin or caller == work.owner) {
            publishingCatalog.remove(id);
            deletedWorks := deletedWorks.concat([id]);
          } else {
            failedWorks := failedWorks.concat([id]);
          };
        };
      };
    };

    for (id in ids.values()) { processId(id) };
    {
      deleted = deletedWorks;
      failed = failedWorks;
    };
  };

  public shared ({ caller }) func bulkDeleteReleases(ids : [LabelEntityId]) : async {
    deleted : [LabelEntityId];
    failed : [LabelEntityId];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete releases");
    };
    var deletedReleases : [LabelEntityId] = [];
    var failedReleases : [LabelEntityId] = [];
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    func processId(id : LabelEntityId) : () {
      switch (releases.get(id)) {
        case (null) {
          failedReleases := failedReleases.concat([id]);
        };
        case (?release) {
          if (isAdmin or caller == release.owner) {
            releases.remove(id);
            deletedReleases := deletedReleases.concat([id]);
          } else {
            failedReleases := failedReleases.concat([id]);
          };
        };
      };
    };

    for (id in ids.values()) { processId(id) };
    {
      deleted = deletedReleases;
      failed = failedReleases;
    };
  };

  public shared ({ caller }) func bulkDeleteRecordingProjects(ids : [RecodingId]) : async {
    deleted : [RecodingId];
    failed : [RecodingId];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete recording projects");
    };
    var deletedProjects : [RecodingId] = [];
    var failedProjects : [RecodingId] = [];
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    func processId(id : RecodingId) : () {
      switch (recordingProjects.get(id)) {
        case (null) {
          failedProjects := failedProjects.concat([id]);
        };
        case (?project) {
          if (isAdmin or caller == project.owner) {
            recordingProjects.remove(id);
            deletedProjects := deletedProjects.concat([id]);
          } else {
            failedProjects := failedProjects.concat([id]);
          };
        };
      };
    };

    for (id in ids.values()) { processId(id) };
    {
      deleted = deletedProjects;
      failed = failedProjects;
    };
  };

  public shared ({ caller }) func bulkDeleteArtistDevelopment(ids : [ArtistDevelopmentId]) : async {
    deleted : [ArtistDevelopmentId];
    failed : [ArtistDevelopmentId];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete artist development entries");
    };
    var deletedArtists : [ArtistDevelopmentId] = [];
    var failedArtists : [ArtistDevelopmentId] = [];
    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    func processId(id : ArtistDevelopmentId) : () {
      switch (artistDevelopment.get(id)) {
        case (null) {
          failedArtists := failedArtists.concat([id]);
        };
        case (?entry) {
          if (isAdmin or caller == entry.owner) {
            artistDevelopment.remove(id);
            deletedArtists := deletedArtists.concat([id]);
          } else {
            failedArtists := failedArtists.concat([id]);
          };
        };
      };
    };

    for (id in ids.values()) { processId(id) };
    {
      deleted = deletedArtists;
      failed = failedArtists;
    };
  };

  public shared ({ caller }) func linkMembershipToEntities(
    memberId : MemberId,
    artistIds : [ArtistDevelopmentId],
    workIds : [PublishingId],
    releaseIds : [LabelEntityId],
    projectIds : [RecodingId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link memberships");
    };
    switch (memberships.get(memberId)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only link your own membership");
        };
        memberships.add(memberId, {
          membership with
          linkedArtists = artistIds;
          linkedWorks = workIds;
          linkedReleases = releaseIds;
          linkedProjects = projectIds;
        });
      };
    };
  };

  public shared ({ caller }) func linkPublishingWorkToEntities(
    workId : PublishingId,
    memberIds : [MemberId],
    artistIds : [ArtistDevelopmentId],
    releaseIds : [LabelEntityId],
    projectIds : [RecodingId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link publishing works");
    };
    switch (publishingCatalog.get(workId)) {
      case (null) { Runtime.trap("Publishing work not found") };
      case (?work) {
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only link your own publishing work");
        };
        publishingCatalog.add(workId, {
          work with
          linkedMembers = memberIds;
          linkedArtists = artistIds;
          linkedReleases = releaseIds;
          linkedProjects = projectIds;
        });
      };
    };
  };

  public shared ({ caller }) func linkReleaseToEntities(
    releaseId : LabelEntityId,
    memberIds : [MemberId],
    artistIds : [ArtistDevelopmentId],
    workIds : [PublishingId],
    projectIds : [RecodingId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link releases");
    };
    switch (releases.get(releaseId)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own releases");
        };
        releases.add(releaseId, {
          release with
          linkedMembers = memberIds;
          linkedArtists = artistIds;
          linkedWorks = workIds;
          linkedProjects = projectIds;
        });
      };
    };
  };

  public shared ({ caller }) func linkProjectToEntities(
    projectId : RecodingId,
    memberIds : [MemberId],
    artistIds : [ArtistDevelopmentId],
    workIds : [PublishingId],
    releaseIds : [LabelEntityId],
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can link recording projects");
    };
    switch (recordingProjects.get(projectId)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        if (caller != project.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only link your own recording projects");
        };
        recordingProjects.add(projectId, {
          project with
          linkedMembers = memberIds;
          linkedArtists = artistIds;
          linkedWorks = workIds;
          linkedReleases = releaseIds;
        });
      };
    };
  };

  public query ({ caller }) func getEntitiesForCaller() : async {
    memberships : [(MemberId, Membership)];
    publishingWorks : [PublishingWork];
    releases : [Release];
    recordingProjects : [RecordingProject];
    artistDevelopment : [ArtistDevelopment];
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can query entities");
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);

    let filteredMemberships = if (isAdmin) {
      memberships.toArray();
    } else {
      memberships.toArray().filter(func((_, m)) { m.profile.principal == caller });
    };

    let filteredPublishingWorks = if (isAdmin) {
      publishingCatalog.values().toArray();
    } else {
      publishingCatalog.values().toArray().filter(func(w) { w.owner == caller });
    };

    let filteredReleases = if (isAdmin) {
      releases.values().toArray();
    } else {
      releases.values().toArray().filter(func(r) { r.owner == caller });
    };

    let filteredRecordingProjects = if (isAdmin) {
      recordingProjects.values().toArray();
    } else {
      recordingProjects.values().toArray().filter(func(p) { p.owner == caller });
    };

    let filteredArtistDevelopment = if (isAdmin) {
      artistDevelopment.values().toArray();
    } else {
      artistDevelopment.values().toArray().filter(func(a) { a.owner == caller });
    };

    {
      memberships = filteredMemberships;
      publishingWorks = filteredPublishingWorks;
      releases = filteredReleases;
      recordingProjects = filteredRecordingProjects;
      artistDevelopment = filteredArtistDevelopment;
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

  public query ({ caller }) func getAllPublishingWorks() : async [PublishingWork] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all publishing works");
    };
    publishingCatalog.values().toArray();
  };

  public query ({ caller }) func getAllReleases() : async [Release] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all releases");
    };
    releases.values().toArray();
  };

  public query ({ caller }) func getAllRecordingProjects() : async [RecordingProject] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all recording projects");
    };
    recordingProjects.values().toArray();
  };

  public query ({ caller }) func getAllArtistDevelopment() : async [ArtistDevelopment] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all artist development entries");
    };
    artistDevelopment.values().toArray();
  };

  public query ({ caller }) func getArtistDevelopmentByGoals() : async [ArtistDevelopment.ByGoals] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
        Runtime.trap("Unauthorized: Only admins can view sorted artist development");
    };
    let byGoalsArray = artistDevelopment.toArray().map(
      func((_, dev)) {
        {
          id = dev.id;
          artistId = dev.artistId;
          goals = dev.goals.toText();
          created_at = dev.created_at;
        };
      }
    );

    byGoalsArray.sort(ArtistDevelopment.compareByGoals : (ArtistDevelopment.ByGoals, ArtistDevelopment.ByGoals) -> Order.Order);
  };

  public query ({ caller }) func isCallerApproved() : async Bool {
    AccessControl.hasPermission(accessControlState, caller, #admin) or UserApproval.isApproved(approvalState, caller);
  };

  public shared ({ caller }) func requestApproval() : async () {
    UserApproval.requestApproval(approvalState, caller);
  };

  public shared ({ caller }) func setApproval(user : Principal, status : UserApproval.ApprovalStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.setApproval(approvalState, user, status);
  };

  public query ({ caller }) func listApprovals() : async [UserApproval.UserApprovalInfo] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    UserApproval.listApprovals(approvalState);
  };

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
};
