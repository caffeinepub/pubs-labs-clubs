import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { 
  useGetAllMembershipProfiles, 
  useGetAllPublishingWorks, 
  useGetAllReleases,
  useGetAllRecordingProjects,
  useGetAllArtistDevelopment
} from '../../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, Disc, Mic, TrendingUp, ClipboardCheck } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import AccessDeniedScreen from '../../../components/feedback/AccessDeniedScreen';
import LoadingState from '../../../components/feedback/LoadingState';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function AdminDashboardPage() {
  const { isAdmin, isLoading: userLoading } = useCurrentUser();
  const navigate = useNavigate();

  const { data: memberships = [], isLoading: membershipsLoading } = useGetAllMembershipProfiles();
  const { data: works = [], isLoading: worksLoading } = useGetAllPublishingWorks();
  const { data: releases = [], isLoading: releasesLoading } = useGetAllReleases();
  const { data: projects = [], isLoading: projectsLoading } = useGetAllRecordingProjects();
  const { data: artists = [], isLoading: artistsLoading } = useGetAllArtistDevelopment();

  if (userLoading) {
    return <LoadingState />;
  }

  if (!isAdmin) {
    return <AccessDeniedScreen message="Only administrators can access the dashboard." />;
  }

  const isLoading = membershipsLoading || worksLoading || releasesLoading || projectsLoading || artistsLoading;

  const stats = [
    { 
      title: 'Memberships', 
      count: memberships.length, 
      icon: Users, 
      path: '/portal/memberships',
      color: 'text-blue-600 dark:text-blue-400'
    },
    { 
      title: 'Publishing Works', 
      count: works.length, 
      icon: Music, 
      path: '/portal/publishing',
      color: 'text-green-600 dark:text-green-400'
    },
    { 
      title: 'Releases', 
      count: releases.length, 
      icon: Disc, 
      path: '/portal/releases',
      color: 'text-purple-600 dark:text-purple-400'
    },
    { 
      title: 'Recording Projects', 
      count: projects.length, 
      icon: Mic, 
      path: '/portal/recordings',
      color: 'text-orange-600 dark:text-orange-400'
    },
    { 
      title: 'Artist Development', 
      count: artists.length, 
      icon: TrendingUp, 
      path: '/portal/artists',
      color: 'text-pink-600 dark:text-pink-400'
    }
  ];

  // Get recent items (last 5 created)
  const recentItems = [
    ...memberships.slice(-5).map(m => ({ type: 'Membership', name: m.name, date: m.created_at })),
    ...works.slice(-5).map(w => ({ type: 'Publishing', name: w.title, date: w.created_at })),
    ...releases.slice(-5).map(r => ({ type: 'Release', name: r.title, date: r.created_at })),
    ...projects.slice(-5).map(p => ({ type: 'Recording', name: p.title, date: p.created_at })),
    ...artists.slice(-5).map(a => ({ type: 'Artist Dev', name: a.artistId, date: a.created_at }))
  ].sort((a, b) => Number(b.date - a.date)).slice(0, 10);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of all Higgins Music operations</p>
      </div>

      {/* Rollout 21.7 Smoke Test Helper */}
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <ClipboardCheck className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertTitle className="text-blue-900 dark:text-blue-100">Rollout 21.7 Smoke Test</AlertTitle>
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          <p className="mb-2">
            After upgrade, verify the application works correctly by testing with both admin and non-admin approved member accounts.
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Confirm <strong>AuthGate</strong> blocks unauthenticated users and allows authenticated users through</li>
            <li>Confirm <strong>ApprovalGate</strong> allows admins and approved members through</li>
            <li>Test all five detail routes load without crashes: Memberships, Publishing, Releases, Recordings, Artists</li>
            <li>Verify "Edit Links" dialogs open successfully on all five detail routes</li>
            <li>Watch browser console for errors (undefined/null access, runtime traps)</li>
          </ul>
          <p className="mt-2 text-sm">
            <strong>Checklist:</strong> <code className="text-xs bg-blue-100 dark:bg-blue-900 px-1 py-0.5 rounded">frontend/SMOKE_TEST_21_7.md</code>
          </p>
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card 
                  key={stat.title} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate({ to: stat.path })}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.count}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {recentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                <div className="space-y-2">
                  {recentItems.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div>
                        <span className="text-sm font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.type})</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(Number(item.date) / 1000000).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
