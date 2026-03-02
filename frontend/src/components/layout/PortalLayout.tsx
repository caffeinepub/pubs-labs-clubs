import { useNavigate, useRouterState } from '@tanstack/react-router';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  Disc, 
  Mic, 
  TrendingUp,
  Settings,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useState } from 'react';
import BrandHeader from './BrandHeader';
import LoadingState from '../feedback/LoadingState';

interface PortalLayoutProps {
  children: React.ReactNode;
}

export default function PortalLayout({ children }: PortalLayoutProps) {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const { isAdmin, isLoading } = useCurrentUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const currentPath = routerState.location.pathname;

  const navItems = [
    ...(isAdmin ? [{ icon: LayoutDashboard, label: 'Dashboard', path: '/portal' }] : []),
    { icon: Users, label: 'Memberships', path: '/portal/memberships' },
    { icon: Music, label: 'Publishing', path: '/portal/publishing' },
    { icon: Disc, label: 'Releases', path: '/portal/releases' },
    { icon: Mic, label: 'Recordings', path: '/portal/recordings' },
    { icon: TrendingUp, label: 'Artist Development', path: '/portal/artists' },
    ...(isAdmin ? [
      { icon: UserCog, label: 'Role Assignment', path: '/portal/roles' },
      { icon: Settings, label: 'Bootstrap', path: '/portal/bootstrap' }
    ] : [])
  ];

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader showAuth={true} />
      
      <div className="flex">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 md:hidden shadow-lg"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X /> : <Menu />}
        </Button>

        {/* Sidebar */}
        <aside 
          className={`
            fixed md:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 border-r bg-muted/30 z-40
            transition-transform duration-200 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <ScrollArea className="h-full py-6 px-3">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.path;
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => {
                      navigate({ to: item.path });
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                );
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
