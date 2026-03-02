import { useNavigate } from '@tanstack/react-router';
import LoginButton from '../auth/LoginButton';

interface BrandHeaderProps {
  showAuth?: boolean;
}

export default function BrandHeader({ showAuth = false }: BrandHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <button 
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <img 
            src="/assets/generated/higgins-music-logo.dim_512x512.png" 
            alt="Higgins Music" 
            className="h-10 w-10"
          />
          <span className="text-xl font-semibold">Higgins Music</span>
        </button>
        {showAuth && <LoginButton />}
      </div>
    </header>
  );
}
