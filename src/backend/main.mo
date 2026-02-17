import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import UserApproval "user-approval/approval";

// Enable migration with the (with ...) clause

actor {
  type MemberId = Text;
  type PublishingId = Text;
  type LabelEntityId = Text;
  type RecodingId = Text;
  type ArtistDevelopmentId = Text;

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

  // COMPONENT INTEGRATION
  let accessControlState = AccessControl.initState();
  let approvalState = UserApproval.initState(accessControlState);
  include MixinAuthorization(accessControlState);

  // Persistent storage
  var nextEntityId = 0;

  let userProfiles = Map.empty<Principal, UserProfile>();
  let memberships = Map.empty<MemberId, Membership>();
  let publishingCatalog = Map.empty<Text, PublishingWork>();
  let releases = Map.empty<LabelEntityId, Release>();
  let recordingProjects = Map.empty<RecodingId, RecordingProject>();
  let artistDevelopment = Map.empty<ArtistDevelopmentId, ArtistDevelopment>();
  let knownUsers = Map.empty<Principal, SignedInUser>();

  // USER PROFILE FUNCTIONS (Required by frontend)

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

    // Update knownUsers map when saving profile
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

  // MEMBERSHIP FUNCTIONS

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
        // Members can only view their own profile, admins can view all
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own membership profile");
        };
        membership.profile;
      };
    };
  };

  public shared ({ caller }) func updateMembershipProfile(
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
          Runtime.trap("Unauthorized: You do not have permission to update this profile");
        };
        let updatedProfile : MembershipProfile = {
          id;
          principal = existingMembership.profile.principal;
          name;
          email;
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
        updatedProfile;
      };
    };
  };

  // Update all linked entity IDs for membership, preserves existing links if not provided
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
        // Members can only update their own relationships, admins can update all
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

  // Returns all membership data including linked entity IDs
  public query ({ caller }) func getMembershipDetails(id : MemberId) : async Membership {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view membership details");
    };
    switch (memberships.get(id)) {
      case (null) { Runtime.trap("Membership not found") };
      case (?membership) {
        // Members can only view their own record, admins can view all
        if (caller != membership.profile.principal and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own membership record");
        };
        membership;
      };
    };
  };

  // PUBLISHING FUNCTIONS
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
        // Members can only view their own work, admins can view all
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own publishing work");
        };
        work;
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
        // Members can only update their own work, admins can update all
        if (caller != work.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own publishing work");
        };
        publishingCatalog.add(id, {
          work with notes;
        });
      };
    };
  };

  // LABEL MANAGEMENT FUNCTIONS
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
    release;
  };

  public query ({ caller }) func getRelease(releaseId : LabelEntityId) : async Release {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view releases");
    };
    switch (releases.get(releaseId)) {
      case (null) { Runtime.trap("Release not found") };
      case (?release) {
        // Members can only view their own releases, admins can view all
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own releases");
        };
        release;
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
        // Members can only update their own releases, admins can update all
        if (caller != release.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: You can only update your own releases");
        };
        releases.add(releaseId, { release with owners });
      };
    };
  };

  // RECORDING PROJECTS FUNCTIONS
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
    project;
  };

  public query ({ caller }) func getRecordingProject(projectId : RecodingId) : async RecordingProject {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view recording projects");
    };
    switch (recordingProjects.get(projectId)) {
      case (null) { Runtime.trap("Recording project not found") };
      case (?project) {
        // Members can only view their own projects, admins can view all
        if (caller != project.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own recording projects");
        };
        project;
      };
    };
  };

  // ARTIST DEVELOPMENT FUNCTIONS
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
    entry;
  };

  public query ({ caller }) func getArtistDevelopment(entryId : ArtistDevelopmentId) : async ArtistDevelopment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view artist development entries");
    };
    switch (artistDevelopment.get(entryId)) {
      case (null) { Runtime.trap("Artist development entry not found") };
      case (?entry) {
        // Members can only view their own entries, admins can view all
        if (caller != entry.owner and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: you can only view your own artist development entries");
        };
        entry;
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

  // LINKS AND RELATIONSHIPS
  // Membership linking
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
        // Members can only update their own membership, admins can update all
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

  // Publishing work linking
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
        // Members can only update their own work, admins can update all
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

  // Release linking
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
        // Members can only update their own releases, admins can update all
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

  // Recording project linking
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
        // Members can only update their own projects, admins can update all
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

  // Entities Query - Returns entities owned by caller (or all if admin)
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

    // Filter memberships: return only caller's membership or all if admin
    let filteredMemberships = if (isAdmin) {
      memberships.toArray();
    } else {
      memberships.toArray().filter(func((_, m)) { m.profile.principal == caller });
    };

    // Filter publishing works: return only caller's works or all if admin
    let filteredPublishingWorks = if (isAdmin) {
      publishingCatalog.values().toArray();
    } else {
      publishingCatalog.values().toArray().filter(func(w) { w.owner == caller });
    };

    // Filter releases: return only caller's releases or all if admin
    let filteredReleases = if (isAdmin) {
      releases.values().toArray();
    } else {
      releases.values().toArray().filter(func(r) { r.owner == caller });
    };

    // Filter recording projects: return only caller's projects or all if admin
    let filteredRecordingProjects = if (isAdmin) {
      recordingProjects.values().toArray();
    } else {
      recordingProjects.values().toArray().filter(func(p) { p.owner == caller });
    };

    // Filter artist development: return only caller's entries or all if admin
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

  // ADDITIONAL QUERY FUNCTIONS (Admin-only for viewing all data)
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

  // COMPONENT-ENDPOINTS

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

  // ROLLOUT STEP TRACKER (single source of truth)
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




