import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserRole } from '../backend';

export function useCurrentUser() {
  const { actor, isFetching: actorFetching } = useActor();

  const roleQuery = useQuery<UserRole>({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  const approvalQuery = useQuery<boolean>({
    queryKey: ['currentUserApproval'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerApproved();
    },
    enabled: !!actor && !actorFetching,
    retry: false
  });

  const isAdmin = roleQuery.data === UserRole.admin;
  const isApproved = approvalQuery.data === true;
  const isLoading = actorFetching || roleQuery.isLoading || approvalQuery.isLoading;

  return {
    role: roleQuery.data,
    isAdmin,
    isApproved,
    isLoading
  };
}
