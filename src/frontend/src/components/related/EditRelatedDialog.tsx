import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle, Loader2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useActor } from "../../hooks/useActor";
import { normalizeToArray } from "../../utils/arrays";
import MultiSelectList from "./MultiSelectList";

export interface EntityOption {
  id: string;
  label: string;
}

export interface EditRelatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;

  // Available options
  availableMemberships?: EntityOption[];
  memberOptions?: EntityOption[];
  availableArtists?: EntityOption[];
  artistOptions?: EntityOption[];
  availableWorks?: EntityOption[];
  publishingOptions?: EntityOption[];
  availableReleases?: EntityOption[];
  releaseOptions?: EntityOption[];
  availableProjects?: EntityOption[];
  projectOptions?: EntityOption[];

  // Currently selected IDs
  selectedMemberIds?: string[];
  selectedArtistIds?: string[];
  selectedWorkIds?: string[];
  selectedPublishingIds?: string[];
  selectedReleaseIds?: string[];
  selectedProjectIds?: string[];

  onSave: (selections: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    publishingIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => Promise<void> | void;

  isSaving?: boolean;
  isLoadingOptions?: boolean;
  optionsError?: Error | null;
}

export default function EditRelatedDialog({
  open,
  onOpenChange,
  title = "Edit Related Records",
  availableMemberships,
  memberOptions,
  availableArtists,
  artistOptions,
  availableWorks,
  publishingOptions,
  availableReleases,
  releaseOptions,
  availableProjects,
  projectOptions,
  selectedMemberIds,
  selectedArtistIds,
  selectedWorkIds,
  selectedPublishingIds,
  selectedReleaseIds,
  selectedProjectIds,
  onSave,
  isSaving = false,
  isLoadingOptions = false,
  optionsError = null,
}: EditRelatedDialogProps) {
  const { isFetching: actorFetching } = useActor();

  // Resolve options — support both naming conventions
  const resolvedMemberOptions = memberOptions ?? availableMemberships ?? [];
  const resolvedArtistOptions = artistOptions ?? availableArtists ?? [];
  const resolvedPublishingOptions = publishingOptions ?? availableWorks ?? [];
  const resolvedReleaseOptions = releaseOptions ?? availableReleases ?? [];
  const resolvedProjectOptions = projectOptions ?? availableProjects ?? [];

  // Resolve selected IDs — support both naming conventions
  const initMemberIds = normalizeToArray<string>(selectedMemberIds);
  const initArtistIds = normalizeToArray<string>(selectedArtistIds);
  const initWorkIds = normalizeToArray<string>(
    selectedWorkIds ?? selectedPublishingIds,
  );
  const initReleaseIds = normalizeToArray<string>(selectedReleaseIds);
  const initProjectIds = normalizeToArray<string>(selectedProjectIds);

  const [localMemberIds, setLocalMemberIds] = useState<string[]>(initMemberIds);
  const [localArtistIds, setLocalArtistIds] = useState<string[]>(initArtistIds);
  const [localWorkIds, setLocalWorkIds] = useState<string[]>(initWorkIds);
  const [localReleaseIds, setLocalReleaseIds] =
    useState<string[]>(initReleaseIds);
  const [localProjectIds, setLocalProjectIds] =
    useState<string[]>(initProjectIds);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setLocalMemberIds(normalizeToArray<string>(selectedMemberIds));
      setLocalArtistIds(normalizeToArray<string>(selectedArtistIds));
      setLocalWorkIds(
        normalizeToArray<string>(selectedWorkIds ?? selectedPublishingIds),
      );
      setLocalReleaseIds(normalizeToArray<string>(selectedReleaseIds));
      setLocalProjectIds(normalizeToArray<string>(selectedProjectIds));
      setSaveError(null);
    }
  }, [
    open,
    selectedMemberIds,
    selectedArtistIds,
    selectedWorkIds,
    selectedPublishingIds,
    selectedReleaseIds,
    selectedProjectIds,
  ]);

  const handleSave = async () => {
    if (actorFetching) {
      setSaveError(
        "The system is still initializing. Please wait a moment and try again.",
      );
      return;
    }
    setSaveError(null);
    try {
      await onSave({
        memberIds: localMemberIds,
        artistIds: localArtistIds,
        workIds: localWorkIds,
        publishingIds: localWorkIds,
        releaseIds: localReleaseIds,
        projectIds: localProjectIds,
      });
      onOpenChange(false);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save links. Please try again.";
      setSaveError(
        message.includes("Actor not available")
          ? "The system is still initializing. Please wait a moment and try again."
          : message,
      );
    }
  };

  const isDisabled = isSaving || actorFetching || isLoadingOptions;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {actorFetching && (
          <Alert className="mb-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Initializing connection… save will be available shortly.
            </AlertDescription>
          </Alert>
        )}

        {isLoadingOptions && !actorFetching && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {optionsError && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load options: {optionsError.message}
            </AlertDescription>
          </Alert>
        )}

        {saveError && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{saveError}</AlertDescription>
          </Alert>
        )}

        {!isLoadingOptions && (
          <div className="space-y-4 py-2">
            {resolvedMemberOptions.length > 0 && (
              <MultiSelectList
                label="Members"
                options={resolvedMemberOptions}
                selectedIds={localMemberIds}
                onChange={setLocalMemberIds}
              />
            )}
            {resolvedPublishingOptions.length > 0 && (
              <MultiSelectList
                label="Publishing Works"
                options={resolvedPublishingOptions}
                selectedIds={localWorkIds}
                onChange={setLocalWorkIds}
              />
            )}
            {resolvedReleaseOptions.length > 0 && (
              <MultiSelectList
                label="Releases"
                options={resolvedReleaseOptions}
                selectedIds={localReleaseIds}
                onChange={setLocalReleaseIds}
              />
            )}
            {resolvedProjectOptions.length > 0 && (
              <MultiSelectList
                label="Recording Projects"
                options={resolvedProjectOptions}
                selectedIds={localProjectIds}
                onChange={setLocalProjectIds}
              />
            )}
            {resolvedArtistOptions.length > 0 && (
              <MultiSelectList
                label="Artist Development"
                options={resolvedArtistOptions}
                selectedIds={localArtistIds}
                onChange={setLocalArtistIds}
              />
            )}
            {resolvedMemberOptions.length === 0 &&
              resolvedPublishingOptions.length === 0 &&
              resolvedReleaseOptions.length === 0 &&
              resolvedProjectOptions.length === 0 &&
              resolvedArtistOptions.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No linkable records available.
                </p>
              )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isDisabled}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : actorFetching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Initializing…
              </>
            ) : (
              "Save"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
