import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert } from 'lucide-react';

interface AccessDeniedScreenProps {
  message?: string;
}

export default function AccessDeniedScreen({ 
  message = 'You do not have permission to access this area.' 
}: AccessDeniedScreenProps) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            Access Denied
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            If you believe you should have access, please contact an administrator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
