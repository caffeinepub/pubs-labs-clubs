import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddComment,
  useDeleteComment,
  useGetComments,
} from "@/hooks/useComments";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { Loader2, MessageSquare, Trash2 } from "lucide-react";
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

export default function CommentsSection({ recordId }: CommentsSectionProps) {
  const { data: comments, isLoading, error } = useGetComments(recordId);
  const addComment = useAddComment();
  const deleteComment = useDeleteComment();
  const { isAdmin } = useCurrentUser();
  const { identity } = useInternetIdentity();

  const [text, setText] = useState("");

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handlePost();
    }
  };

  return (
    <Card data-ocid="comments.section">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          Comments &amp; Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Loading state */}
        {isLoading && (
          <div className="space-y-3" data-ocid="comments.loading_state">
            {[1, 2].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
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
            className="flex flex-col items-center justify-center py-8 text-center"
            data-ocid="comments.empty_state"
          >
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to add one.
            </p>
          </div>
        )}

        {/* Comment list */}
        {!isLoading && !error && comments && comments.length > 0 && (
          <ol className="space-y-4">
            {comments.map((comment, idx) => {
              const authorStr = comment.author.toString();
              const isOwn =
                currentPrincipal !== null && authorStr === currentPrincipal;
              const canDelete = isAdmin || isOwn;
              const ocidIndex = idx + 1;

              return (
                <li
                  key={String(comment.id)}
                  className="flex gap-3"
                  data-ocid={`comments.item.${ocidIndex}`}
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                      {getInitials(comment.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-mono text-muted-foreground">
                          {truncatePrincipal(comment.author)}
                        </span>
                        <time className="text-xs text-muted-foreground/60">
                          {formatTimestamp(comment.createdAt)}
                        </time>
                      </div>
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-muted-foreground hover:text-destructive shrink-0"
                          onClick={() => handleDelete(comment.id)}
                          disabled={deleteComment.isPending}
                          aria-label="Delete comment"
                          data-ocid={`comments.delete_button.${ocidIndex}`}
                        >
                          {deleteComment.isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words leading-relaxed">
                      {comment.text}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {/* Add comment form */}
        <div className="pt-2 border-t border-border space-y-2">
          <Textarea
            placeholder="Add a comment or note… (Ctrl+Enter to post)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
            className="resize-none text-sm"
            data-ocid="comments.input"
          />
          <div className="flex justify-end">
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
