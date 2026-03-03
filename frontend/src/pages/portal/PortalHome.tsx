import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../../hooks/useQueries';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import ApprovalStatusBanner from '../../components/auth/ApprovalStatusBanner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Music, Disc, Mic2, TrendingUp, LayoutDashboard } from 'lucide-react';

interface NavCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  adminOnly?: boolean;
}

const navCards: NavCard[] = [
  {
    title: 'Memberships',
    description: 'Manage member profiles, statuses, and agreements.',
    icon: <Users className="w-8 h-8" />,
    path: '/portal/memberships',
  },
  {
    title: 'Publishing Works',
    description: 'Track publishing catalog, contributors, and ownership splits.',
    icon: <Music className="w-8 h-8" />,
    path: '/portal/publishing',
  },
  {
    title: 'Releases',
    description: 'Coordinate label releases, tracklists, and workflow checklists.',
    icon: <Disc className="w-8 h-8" />,
    path: '/portal/releases',
  },
  {
    title: 'Recording Projects',
    description: 'Oversee recording sessions, participants, and project status.',
    icon: <Mic2 className="w-8 h-8" />,
    path: '/portal/recordings',
  },
  {
    title: 'Artist Development',
    description: 'Plan goals, milestones, and development strategies for artists.',
    icon: <TrendingUp className="w-8 h-8" />,
    path: '/portal/artists',
  },
  {
    title: 'Admin Dashboard',
    description: 'View system stats, manage users, and configure the platform.',
    icon: <LayoutDashboard className="w-8 h-8" />,
    path: '/portal/admin',
    adminOnly: true,
  },
];

export default function PortalHome() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const { isAdmin, isApproved } = useCurrentUser();

  const visibleCards = navCards.filter(card => !card.adminOnly || isAdmin);
  const displayName = userProfile?.name ?? 'Member';

  return (
    <div className="flex flex-col min-h-full">
      {/* Approval banner for non-approved, non-admin users */}
      {!isAdmin && !isApproved && <ApprovalStatusBanner />}

      <div className="p-6 md:p-8 flex-1">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            Welcome back, {displayName}
          </h1>
          <p className="text-muted-foreground">
            {isAdmin
              ? 'You have full admin access to the Higgins Music portal.'
              : isApproved
              ? 'Your membership is active. Explore the portal sections below.'
              : 'Your membership is pending approval. Some features may be restricted.'}
          </p>
        </div>

        {/* Navigation cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleCards.map((card) => (
            <Card
              key={card.path}
              className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-150 group"
              onClick={() => navigate({ to: card.path })}
            >
              <CardHeader className="pb-3">
                <div className="text-primary mb-2 group-hover:scale-110 transition-transform duration-150 w-fit">
                  {card.icon}
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
