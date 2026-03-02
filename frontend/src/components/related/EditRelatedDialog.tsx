import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';
import MultiSelectList from './MultiSelectList';
import { normalizeToArray } from '../../utils/arrays';

interface EntityOption {
  id: string;
  label: string;
}

interface EditRelatedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  
  // Available entities to link
  availableMemberships?: EntityOption[];
  availableArtists?: EntityOption[];
  availableWorks?: EntityOption[];
  availableReleases?: EntityOption[];
  availableProjects?: EntityOption[];
  
  // Currently selected IDs
  selectedMemberIds?: string[];
  selectedArtistIds?: string[];
  selectedWorkIds?: string[];
  selectedReleaseIds?: string[];
  selectedProjectIds?: string[];
  
  // Save handler
  onSave: (data: {
    memberIds: string[];
    artistIds: string[];
    workIds: string[];
    releaseIds: string[];
    projectIds: string[];
  }) => void;
  
  isSaving?: boolean;
  isLoadingOptions?: boolean;
  optionsError?: Error | null;
}

export default function EditRelatedDialog({
  open,
  onOpenChange,
  title,
  availableMemberships = [],
  availableArtists = [],
  availableWorks = [],
  availableReleases = [],
  availableProjects = [],
  selectedMemberIds,
  selectedArtistIds,
  selectedWorkIds,
  selectedReleaseIds,
  selectedProjectIds,
  onSave,
  isSaving = false,
  isLoadingOptions = false,
  optionsError = null
}: EditRelatedDialogProps) {
  // Normalize selected IDs to handle upgrade-time undefined/null values
  const safeMemberIds = normalizeToArray<string>(selectedMemberIds);
  const safeArtistIds = normalizeToArray<string>(selectedArtistIds);
  const safeWorkIds = normalizeToArray<string>(selectedWorkIds);
  const safeReleaseIds = normalizeToArray<string>(selectedReleaseIds);
  const safeProjectIds = normalizeToArray<string>(selectedProjectIds);

  const [memberIds, setMemberIds] = useState<string[]>(safeMemberIds);
  const [artistIds, setArtistIds] = useState<string[]>(safeArtistIds);
  const [workIds, setWorkIds] = useState<string[]>(safeWorkIds);
  const [releaseIds, setReleaseIds] = useState<string[]>(safeReleaseIds);
  const [projectIds, setProjectIds] = useState<string[]>(safeProjectIds);

  // Reset state when dialog opens with new data
  useEffect(() => {
    if (open) {
      setMemberIds(safeMemberIds);
      setArtistIds(safeArtistIds);
      setWorkIds(safeWorkIds);
      setReleaseIds(safeReleaseIds);
      setProjectIds(safeProjectIds);
    }
  }, [open, safeMemberIds, safeArtistIds, safeWorkIds, safeReleaseIds, safeProjectIds]);

  const handleSave = () => {
    onSave({
      memberIds,
      artistIds,
      workIds,
      releaseIds,
      projectIds
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        {isLoadingOptions ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Loading available records...</p>
            </div>
          </div>
        ) : optionsError ? (
          <div className="flex-1 py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load available records: {optionsError.message}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
            {availableMemberships.length > 0 && (
              <>
                <MultiSelectList
                  label="Memberships"
                  options={availableMemberships}
                  selectedIds={memberIds}
                  onChange={setMemberIds}
                />
                <Separator />
              </>
            )}

            {availableArtists.length > 0 && (
              <>
                <MultiSelectList
                  label="Artist Development"
                  options={availableArtists}
                  selectedIds={artistIds}
                  onChange={setArtistIds}
                />
                <Separator />
              </>
            )}

            {availableWorks.length > 0 && (
              <>
                <MultiSelectList
                  label="Publishing Works"
                  options={availableWorks}
                  selectedIds={workIds}
                  onChange={setWorkIds}
                />
                <Separator />
              </>
            )}

            {availableReleases.length > 0 && (
              <>
                <MultiSelectList
                  label="Releases"
                  options={availableReleases}
                  selectedIds={releaseIds}
                  onChange={setReleaseIds}
                />
                <Separator />
              </>
            )}

            {availableProjects.length > 0 && (
              <>
                <MultiSelectList
                  label="Recording Projects"
                  options={availableProjects}
                  selectedIds={projectIds}
                  onChange={setProjectIds}
                />
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || isLoadingOptions}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
