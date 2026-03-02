import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ErrorBannerProps {
  title?: string;
  message: string;
}

export default function ErrorBanner({ title = 'Error', message }: ErrorBannerProps) {
  // Convert backend authorization errors to user-friendly messages
  const friendlyMessage = message.includes('Unauthorized') 
    ? 'You do not have permission to perform this action.'
    : message.includes('not found')
    ? 'The requested item could not be found.'
    : message;

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{friendlyMessage}</AlertDescription>
    </Alert>
  );
}
