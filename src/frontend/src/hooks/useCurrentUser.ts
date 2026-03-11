import { useQuery } from "@tanstack/react-query";
import { UserRole } from "../backend";
import { useDemoMode } from "../contexts/DemoModeContext";
import { useActor } from "./useActor";

export function useCurrentUser() {
  const { isDemoMode, activeConfig } = useDemoMode();
  const { actor, isFetching: actorFetching } = useActor();

  const roleQuery = useQuery<UserRole>({
    queryKey: ["currentUserRole"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserRole();
    },
    enabled: !isDemoMode && !!actor && !actorFetching,
    retry: false,
  });

  const approvalQuery = useQuery<boolean>({
    queryKey: ["currentUserApproval"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.isCallerApproved();
    },
    enabled: !isDemoMode && !!actor && !actorFetching,
    retry: false,
  });

  // Demo mode overrides
  if (isDemoMode && activeConfig) {
    return {
      role: activeConfig.role,
      isAdmin: activeConfig.role === UserRole.admin,
      isApproved: activeConfig.isApproved,
      isLoading: false,
      isFetched: true,
    };
  }

  const isAdmin = roleQuery.data === UserRole.admin;
  const isApproved = approvalQuery.data === true;
  const isLoading =
    actorFetching || roleQuery.isLoading || approvalQuery.isLoading;
  const isFetched = !!actor && roleQuery.isFetched && approvalQuery.isFetched;

  return {
    role: roleQuery.data,
    isAdmin,
    isApproved,
    isLoading,
    isFetched,
  };
}
