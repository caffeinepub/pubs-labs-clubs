import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";

import AuthGate from "./components/auth/AuthGate";
import PortalLayout from "./components/layout/PortalLayout";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { PortalSettingsProvider } from "./contexts/PortalSettingsContext";
// Pages
import LandingPage from "./pages/LandingPage";
import PortalHome from "./pages/portal/PortalHome";
import AdminBootstrapPage from "./pages/portal/admin/AdminBootstrapPage";
import AdminDashboardPage from "./pages/portal/admin/AdminDashboardPage";
import AdminSettingsPage from "./pages/portal/admin/AdminSettingsPage";
import RoleAssignmentPage from "./pages/portal/admin/RoleAssignmentPage";
import RolloutWizardPage from "./pages/portal/admin/RolloutWizardPage";
import ArtistDevelopmentDetail from "./pages/portal/artists/ArtistDevelopmentDetail";
import ArtistDevelopmentPage from "./pages/portal/artists/ArtistDevelopmentPage";
import ReleaseDetail from "./pages/portal/label/ReleaseDetail";
import ReleasesPage from "./pages/portal/label/ReleasesPage";
import MembershipDetail from "./pages/portal/memberships/MembershipDetail";
import MembershipsPage from "./pages/portal/memberships/MembershipsPage";
import PublishingWorkDetail from "./pages/portal/publishing/PublishingWorkDetail";
import PublishingWorksPage from "./pages/portal/publishing/PublishingWorksPage";
import RecordingProjectDetail from "./pages/portal/recordings/RecordingProjectDetail";
import RecordingProjectsPage from "./pages/portal/recordings/RecordingProjectsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Landing page route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: LandingPage,
});

// Portal parent route (wrapped in AuthGate)
const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/portal",
  component: () => (
    <AuthGate>
      <PortalLayout />
    </AuthGate>
  ),
});

// Portal home route — default landing after login
const portalHomeRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/",
  component: PortalHome,
});

// Portal index redirect (handles /portal with no trailing slash)
const portalIndexRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/home",
  beforeLoad: () => {
    throw redirect({ to: "/portal" });
  },
});

// Memberships
const membershipsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/memberships",
  component: MembershipsPage,
});

const membershipDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/memberships/$id",
  component: MembershipDetail,
});

// Publishing
const publishingRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/publishing",
  component: PublishingWorksPage,
});

const publishingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/publishing/$id",
  component: PublishingWorkDetail,
});

// Releases
const releasesRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/releases",
  component: ReleasesPage,
});

const releaseDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/releases/$id",
  component: ReleaseDetail,
});

// Recording Projects
const recordingsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/recordings",
  component: RecordingProjectsPage,
});

const recordingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/recordings/$id",
  component: RecordingProjectDetail,
});

// Artist Development
const artistsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/artists",
  component: ArtistDevelopmentPage,
});

const artistDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/artists/$id",
  component: ArtistDevelopmentDetail,
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/admin",
  component: AdminDashboardPage,
});

const roleAssignmentRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/admin/roles",
  component: RoleAssignmentPage,
});

const adminBootstrapRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/admin/bootstrap",
  component: AdminBootstrapPage,
});

const rolloutWizardRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/admin/rollout-wizard",
  component: RolloutWizardPage,
});

const adminSettingsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: "/admin/settings",
  component: AdminSettingsPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  portalRoute.addChildren([
    portalHomeRoute,
    portalIndexRoute,
    membershipsRoute,
    membershipDetailRoute,
    publishingRoute,
    publishingDetailRoute,
    releasesRoute,
    releaseDetailRoute,
    recordingsRoute,
    recordingDetailRoute,
    artistsRoute,
    artistDetailRoute,
    adminDashboardRoute,
    roleAssignmentRoute,
    adminBootstrapRoute,
    rolloutWizardRoute,
    adminSettingsRoute,
  ]),
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <PortalSettingsProvider>
            <RouterProvider router={router} />
            <Toaster />
          </PortalSettingsProvider>
        </ThemeProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
}
