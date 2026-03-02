import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Music, Users, Disc, Mic, TrendingUp } from 'lucide-react';
import BrandHeader from '../components/layout/BrandHeader';

export default function LandingPage() {
  const { identity, login, loginStatus } = useInternetIdentity();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity) {
      navigate({ to: '/portal' });
    }
  }, [identity, navigate]);

  const handleSignIn = () => {
    login();
  };

  return (
    <div className="min-h-screen bg-background">
      <BrandHeader showAuth={true} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: 'url(/assets/generated/higgins-music-hero.dim_1920x640.png)' }}
        />
        <div className="relative container mx-auto px-4 py-24 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
              Your Music, Your Future
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8">
              A co-operative music company supporting artists through publishing, label management, recordings, and development.
            </p>
            <Button 
              size="lg" 
              onClick={handleSignIn}
              disabled={loginStatus === 'logging-in'}
              className="text-lg px-8 py-6"
            >
              {loginStatus === 'logging-in' ? 'Signing In...' : 'Sign In to Portal'}
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Services</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <ServiceCard
              icon={<Music className="w-10 h-10" />}
              title="Publishing"
              description="Comprehensive music publishing services including catalog management, rights administration, and royalty tracking."
            />
            <ServiceCard
              icon={<Disc className="w-10 h-10" />}
              title="Label Management"
              description="Full-service label operations from release planning to distribution, marketing, and workflow coordination."
            />
            <ServiceCard
              icon={<Mic className="w-10 h-10" />}
              title="Recordings & Production"
              description="Professional recording project management, session coordination, and production oversight."
            />
            <ServiceCard
              icon={<TrendingUp className="w-10 h-10" />}
              title="Artist Development"
              description="Strategic career planning, milestone tracking, and comprehensive support for growing artists."
            />
          </div>
        </div>
      </section>

      {/* Co-op Model Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center mb-6">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">Co-operative Membership</h2>
            <p className="text-lg text-muted-foreground text-center mb-8">
              Higgins Music operates as a co-operative, putting artists first. Members benefit from shared resources, 
              transparent operations, and collective decision-making that ensures the best outcomes for all.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <BenefitCard
                title="Shared Success"
                description="Collective growth benefits all members through fair revenue sharing and transparent operations."
              />
              <BenefitCard
                title="Artist-First"
                description="Decisions are made with artists' best interests at heart, not corporate profits."
              />
              <BenefitCard
                title="Full Support"
                description="Access to comprehensive services and resources to help you succeed at every stage."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Higgins Music. Built with love using{' '}
            <a 
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

function ServiceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-card p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow">
      <div className="text-primary mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

function BenefitCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
