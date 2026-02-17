import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
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
    role : {
      #admin;
      #user;
      #guest;
    };
  };

  // MEMBERSHIP
  module MemberStatus {
    public type T = {
      #applicant;
      #active;
      #paused;
      #inactive;
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
    created_at : Int;
    updated_at : Int;
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
    created_at : Int;
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
    created_at : Int;
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
    sessionDate : Int;
    status : ProjectStatus;
    notes : Text;
    assetReferences : [Text];
    linkedMembers : [MemberId];
    linkedArtists : [ArtistDevelopmentId];
    linkedWorks : [PublishingId];
    linkedReleases : [LabelEntityId];
    created_at : Int;
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
    created_at : Int;
  };

  public type OldActor = {
    nextEntityId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    memberships : Map.Map<MemberId, Membership>;
    publishingCatalog : Map.Map<Text, PublishingWork>;
    releases : Map.Map<LabelEntityId, Release>;
    recordingProjects : Map.Map<RecodingId, RecordingProject>;
    artistDevelopment : Map.Map<ArtistDevelopmentId, ArtistDevelopment>;
    knownUsers : Map.Map<Principal, SignedInUser>;
  };

  public type NewActor = {
    nextEntityId : Nat;
    userProfiles : Map.Map<Principal, UserProfile>;
    memberships : Map.Map<MemberId, Membership>;
    publishingCatalog : Map.Map<Text, PublishingWork>;
    releases : Map.Map<LabelEntityId, Release>;
    recordingProjects : Map.Map<RecodingId, RecordingProject>;
    artistDevelopment : Map.Map<ArtistDevelopmentId, ArtistDevelopment>;
    knownUsers : Map.Map<Principal, SignedInUser>;
  };

  public func run(old : OldActor) : NewActor {
    // Types identical in this version; migration is a pass-through.
    old;
  };
};
