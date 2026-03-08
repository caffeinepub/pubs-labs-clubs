import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddComment,
  useDeleteComment,
  useGetComments,
} from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import {
  CheckCheck,
  Edit3,
  Loader2,
  MessageSquare,
  Trash2,
  X,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

interface CommentsSectionProps {
  recordId: string;
}

function formatTimestamp(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncatePrincipal(principal: { toString(): string }): string {
  const str = principal.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}…${str.slice(-6)}`;
}

function getInitials(principal: { toString(): string }): string {
  const str = principal.toString();
  return str.slice(0, 2).toUpperCase();
}

// Avatar color derived from principal string for visual distinction
function getAvatarHue(principal: { toString(): string }): string {
  const str = principal.toString();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) & 0xffff;
  }
  const hue = hash % 360;
  return `oklch(0.5 0.15 ${hue})`;
}

export default function CommentsSection({ recordId }: CommentsSectionProps) {
  const { data: comments, isLoading, error } = useGetComments(recordId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const [text, setText] = useState("");
  // Track which comment is being edited and the edit text
  const [editingId, setEditingId] = useState<bigint | null>(null);
  const [editText, setEditText] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const currentPrincipal = identity?.getPrincipal().toString() ?? null;

  const handlePost = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    try {
      await addComment.mutateAsync({ recordId, text: trimmed });
      setText("");
      toast.success("Comment posted");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post comment";
      toast.error(
        msg.includes("Actor not available")
          ? "Still initializing — please try again shortly."
          : msg,
      );
    }
  };

  const handleDelete = async (commentId: bigint) => {
    try {
      await deleteComment.mutateAsync({ recordId, commentId });
      // If we were editing this comment, cancel edit
      if (editingId === commentId) {
        setEditingId(null);
        setEditText("");
      }
      toast.success("Comment deleted");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete comment";
      toast.error(
        msg.includes("Actor not available")
          ? "Still initializing — please try again shortly."
          : msg,
      );
    }
  };

  // Inline edit: delete old comment and post edited version
  const handleStartEdit = (commentId: bigint, currentText: string) => {
    setEditingId(commentId);
    setEditText(currentText);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId: bigint) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    setIsSavingEdit(true);
    try {
      // Delete old, post new (backend has no updateComment endpoint)
      await deleteComment.mutateAsync({ recordId, commentId });
      await addComment.mutateAsync({ recordId, text: trimmed });
      setEditingId(null);
      setEditText("");
      toast.success("Comment updated");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to update comment";
      toast.error(
        msg.includes("Actor not available")
          ? "Still initializing — please try again shortly."
          : msg,
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleNewKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  const handleEditKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    commentId: bigint,
  ) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSaveEdit(commentId);
    }
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <Card data-ocid="comments.section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Comments &amp; Notes
          {comments && comments.length > 0 && (
            <span className="ml-auto text-xs font-normal text-muted-foreground bg-muted rounded-full px-2 py-0.5">
              {comments.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4" data-ocid="comments.loading_state">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3 items-start">
                <Skeleton className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <p
            className="text-sm text-destructive"
            data-ocid="comments.error_state"
          >
            {error instanceof Error
              ? error.message
              : "Failed to load comments."}
          </p>
        )}

        {/* Empty state */}
        {!isLoading && !error && (!comments || comments.length === 0) && (
          <div
            className="flex flex-col items-center justify-center py-10 text-center gap-3"
            data-ocid="comments.empty_state"
          >
            <div className="rounded-full bg-muted p-3">
              <MessageSquare className="h-5 w-5 text-muted-foreground/50" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/70">
                No comments yet
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Be the first to add a comment or note.
              </p>
            </div>
          </div>
        )}

        {/* Comment list */}
        {!isLoading && !error && comments && comments.length > 0 && (
          <ol className="space-y-0">
            {comments.map((comment, idx) => {
              const authorStr = comment.author.toString();
              const isOwn =
                currentPrincipal !== null && authorStr === currentPrincipal;
              const canDelete = isAdmin || isOwn;
              const canEdit = isOwn; // only comment owner can edit
              const ocidIndex = idx + 1;
              const isCurrentlyEditing = editingId === comment.id;
              const avatarColor = getAvatarHue(comment.author);

              return (
                <li key={String(comment.id)}>
                  {idx > 0 && <Separator className="my-3" />}
                  <div
                    className="flex gap-3 items-start"
                    data-ocid={`comments.item.${ocidIndex}`}
                  >
                    {/* Avatar */}
                    <Avatar className="h-9 w-9 shrink-0 ring-2 ring-background">
                      <AvatarFallback
                        className="text-xs font-bold text-white"
                        style={{ backgroundColor: avatarColor }}
                      >
                        {getInitials(comment.author)}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Meta row */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0 flex-wrap">
                          <span className="text-xs font-mono font-medium text-foreground/80 truncate">
                            {truncatePrincipal(comment.author)}
                          </span>
                          {isOwn && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/10 rounded px-1.5 py-0.5 leading-none">
                              You
                            </span>
                          )}
                          <time className="text-xs text-muted-foreground/60 shrink-0">
                            {formatTimestamp(comment.createdAt)}
                          </time>
                        </div>

                        {/* Action buttons (only shown when not editing) */}
                        {!isCurrentlyEditing && (
                          <div className="flex items-center gap-0.5 shrink-0">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-foreground"
                                onClick={() =>
                                  handleStartEdit(comment.id, comment.text)
                                }
                                aria-label="Edit comment"
                                data-ocid={`comments.edit_button.${ocidIndex}`}
                              >
                                <Edit3 className="h-3 w-3" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(comment.id)}
                                disabled={deleteComment.isPending}
                                aria-label="Delete comment"
                                data-ocid={`comments.delete_button.${ocidIndex}`}
                              >
                                {deleteComment.isPending &&
                                editingId === null ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Comment body: show inline editor or text */}
                      {isCurrentlyEditing ? (
                        <div className="space-y-2 mt-1">
                          <Textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyDown={(e) => handleEditKeyDown(e, comment.id)}
                            rows={3}
                            className="resize-none text-sm bg-muted/40 focus:bg-background"
                            placeholder="Edit your comment…"
                            autoFocus
                          />
                          <div className="flex items-center gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={handleCancelEdit}
                              disabled={isSavingEdit}
                              data-ocid="comments.cancel_button"
                            >
                              <X className="h-3 w-3" />
                              Cancel
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs gap-1"
                              onClick={() => handleSaveEdit(comment.id)}
                              disabled={
                                !editText.trim() ||
                                isSavingEdit ||
                                editText.trim() === comment.text
                              }
                              data-ocid="comments.save_button"
                            >
                              {isSavingEdit ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  Saving…
                                </>
                              ) : (
                                <>
                                  <CheckCheck className="h-3 w-3" />
                                  Save
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap break-words leading-relaxed text-foreground/90">
                          {comment.text}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Add comment form */}
        <div className="pt-3 border-t border-border space-y-2">
          <Textarea
            placeholder="Add a comment or note… (Ctrl+Enter to post)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleNewKeyDown}
            rows={3}
            className="resize-none text-sm"
            data-ocid="comments.textarea"
          />
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {text.length > 0 && `${text.length} chars · `}
              Ctrl+Enter to post
            </p>
            <Button
              size="sm"
              onClick={handlePost}
              disabled={!text.trim() || addComment.isPending}
              data-ocid="comments.submit_button"
            >
              {addComment.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Posting…
                </>
              ) : (
                "Post Comment"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
