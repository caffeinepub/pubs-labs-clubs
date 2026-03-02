import { RouterProvider, createRouter, createRoute, createRootRoute, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { useInternetIdentity } from './hooks/useInternetIdentity';

// Pages
import LandingPage from './pages/LandingPage';
import PortalLayout from './components/layout/PortalLayout';
import MembershipsPage from './pages/portal/memberships/MembershipsPage';
import PublishingWorksPage from './pages/portal/publishing/PublishingWorksPage';
import ReleasesPage from './pages/portal/label/ReleasesPage';
import RecordingProjectsPage from './pages/portal/recordings/RecordingProjectsPage';
import ArtistDevelopmentPage from './pages/portal/artists/ArtistDevelopmentPage';
import AdminDashboardPage from './pages/portal/admin/AdminDashboardPage';
import RoleAssignmentPage from './pages/portal/admin/RoleAssignmentPage';
import AdminBootstrapPage from './pages/portal/admin/AdminBootstrapPage';
import MembershipDetail from './pages/portal/memberships/MembershipDetail';
import PublishingWorkDetail from './pages/portal/publishing/PublishingWorkDetail';
import ReleaseDetail from './pages/portal/label/ReleaseDetail';
import RecordingProjectDetail from './pages/portal/recordings/RecordingProjectDetail';
import ArtistDevelopmentDetail from './pages/portal/artists/ArtistDevelopmentDetail';

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
  path: '/',
  component: LandingPage,
});

// Portal parent route
const portalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/portal',
  component: PortalLayout,
});

// Portal index redirect
const portalIndexRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: '/portal/memberships' });
  },
});

// Memberships
const membershipsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships',
  component: MembershipsPage,
});

const membershipDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships/$id',
  component: MembershipDetail,
});

// Publishing
const publishingRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing',
  component: PublishingWorksPage,
});

const publishingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing/$id',
  component: PublishingWorkDetail,
});

// Releases
const releasesRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases',
  component: ReleasesPage,
});

const releaseDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases/$id',
  component: ReleaseDetail,
});

// Recording Projects
const recordingsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings',
  component: RecordingProjectsPage,
});

const recordingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings/$id',
  component: RecordingProjectDetail,
});

// Artist Development
const artistsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists',
  component: ArtistDevelopmentPage,
});

const artistDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists/$id',
  component: ArtistDevelopmentDetail,
});

// Admin routes
const adminDashboardRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/admin',
  component: AdminDashboardPage,
});

const roleAssignmentRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/admin/roles',
  component: RoleAssignmentPage,
});

const adminBootstrapRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/admin/bootstrap',
  component: AdminBootstrapPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  portalRoute.addChildren([
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
  ]),
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

function AppContent() {
  return (
    <RouterProvider router={router} />
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <AppContent />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
