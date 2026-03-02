import { createRouter, RouterProvider, createRoute, createRootRoute, Outlet, ErrorComponent } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

function RootErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Application Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-4">An unexpected error occurred while rendering the application.</p>
            <p className="text-sm font-mono bg-destructive/10 p-2 rounded mb-4 break-words">
              {error.message}
            </p>
            <Button onClick={reset} variant="outline" size="sm">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: () => <Outlet />,
  errorComponent: RootErrorComponent
});

const landingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Page Error</AlertTitle>
        <AlertDescription>
          Failed to load landing page: {error.message}
        </AlertDescription>
      </Alert>
    </div>
  )
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
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Portal Error</AlertTitle>
        <AlertDescription>
          Failed to load portal: {error.message}
        </AlertDescription>
      </Alert>
    </div>
  )
});

const dashboardRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/',
  component: AdminDashboardPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Dashboard Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const bootstrapRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/bootstrap',
  component: AdminBootstrapPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Bootstrap Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const roleAssignmentRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/roles',
  component: RoleAssignmentPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Role Assignment Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const membershipsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships',
  component: MembershipsPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Memberships Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const membershipDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/memberships/$id',
  component: MembershipDetail,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Membership Detail Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const publishingRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing',
  component: PublishingWorksPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Publishing Works Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const publishingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/publishing/$id',
  component: PublishingWorkDetail,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Publishing Work Detail Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const releasesRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases',
  component: ReleasesPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Releases Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const releaseDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/releases/$id',
  component: ReleaseDetail,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Release Detail Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const recordingsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings',
  component: RecordingProjectsPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recording Projects Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const recordingDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/recordings/$id',
  component: RecordingProjectDetail,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Recording Project Detail Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const artistsRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists',
  component: ArtistDevelopmentPage,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Artist Development Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

const artistDetailRoute = createRoute({
  getParentRoute: () => portalRoute,
  path: '/artists/$id',
  component: ArtistDevelopmentDetail,
  errorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Artist Development Detail Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
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

const router = createRouter({ 
  routeTree,
  defaultErrorComponent: ({ error }) => (
    <div className="p-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  )
});

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
