import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useActor } from './hooks/useActor';
import LandingPage from './pages/LandingPage';
import PortalLayout from './components/layout/PortalLayout';
import AdminDashboardPage from './pages/portal/admin/AdminDashboardPage';
import MembershipsPage from './pages/portal/memberships/MembershipsPage';
import MembershipDetail from './pages/portal/memberships/MembershipDetail';
import PublishingWorksPage from './pages/portal/publishing/PublishingWorksPage';
import PublishingWorkDetail from './pages/portal/publishing/PublishingWorkDetail';
import ReleasesPage from './pages/portal/label/ReleasesPage';
import ReleaseDetail from './pages/portal/label/ReleaseDetail';
import RecordingProjectsPage from './pages/portal/recordings/RecordingProjectsPage';
import RecordingProjectDetail from './pages/portal/recordings/RecordingProjectDetail';
import ArtistDevelopmentPage from './pages/portal/artists/ArtistDevelopmentPage';
import ArtistDevelopmentDetail from './pages/portal/artists/ArtistDevelopmentDetail';
import AdminBootstrapPage from './pages/portal/admin/AdminBootstrapPage';
import RoleAssignmentPage from './pages/portal/admin/RoleAssignmentPage';
import AuthGate from './components/auth/AuthGate';
import ApprovalGate from './components/auth/ApprovalGate';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';

const rootRoute = createRootRoute({
  component: () => <Outlet />
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage
});

const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: () => (
    <AuthGate>
      <ApprovalGate>
        <ProfileSetupModal />
        <PortalLayout>
          <Outlet />
        </PortalLayout>
      </ApprovalGate>
    </AuthGate>
  )
});

const dashboardRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/',
  component: AdminDashboardPage
});

const bootstrapRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/bootstrap',
  component: AdminBootstrapPage
});

const roleAssignmentRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/roles',
  component: RoleAssignmentPage
});

const membershipsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships',
  component: MembershipsPage
});

const membershipDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships/$id',
  component: MembershipDetail
});

const publishingRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing',
  component: PublishingWorksPage
});

const publishingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing/$id',
  component: PublishingWorkDetail
});

const releasesRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases',
  component: ReleasesPage
});

const releaseDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases/$id',
  component: ReleaseDetail
});

const recordingsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings',
  component: RecordingProjectsPage
});

const recordingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings/$id',
  component: RecordingProjectDetail
});

const artistsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists',
  component: ArtistDevelopmentPage
});

const artistDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists/$id',
  component: ArtistDevelopmentDetail
});

const routeTree = rootRoute.addChildren([
  landingRoute,
  portalRoute.addChildren([
    dashboardRoute,
    bootstrapRoute,
    roleAssignmentRoute,
    membershipsRoute,
    membershipDetailRoute,
    publishingRoute,
    publishingDetailRoute,
    releasesRoute,
    releaseDetailRoute,
    recordingsRoute,
    recordingDetailRoute,
    artistsRoute,
    artistDetailRoute
  ])
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}
