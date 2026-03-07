import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Comment } from "../backend";
import { useActor } from "./useActor";

// ─── Comments Hooks ───────────────────────────────────────────────────────────

export function useGetComments(recordId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Comment[]>({
    queryKey: ["comments", recordId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getComments(recordId);
    },
    enabled: !!actor && !isFetching && !!recordId,
  });
}

export function useAddComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      text,
    }: {
      recordId: string;
      text: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addComment(recordId, text);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.recordId],
      });
    },
  });
}

export function useDeleteComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      commentId,
    }: {
      recordId: string;
      commentId: bigint;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.deleteComment(recordId, commentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.recordId],
      });
    },
  });
}
