import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export default function AdminBootstrapPage() {
  const currentUrl = window.location.origin;
  const exampleUrl = `${currentUrl}/#caffeineAdminToken=YOUR_SECRET_TOKEN`;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Bootstrap</h1>
        <p className="text-muted-foreground">Initialize the first administrator account</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The admin bootstrap mechanism is already integrated into the application via the useActor hook.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>How to Bootstrap an Admin</CardTitle>
          <CardDescription>Follow these steps to create the first admin account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Step 1: Get Your Secret Token</h3>
            <p className="text-sm text-muted-foreground">
              The admin secret token is set during canister deployment. Contact your deployment administrator 
              or check your deployment configuration for the secret token.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Step 2: Open the App with the Token</h3>
            <p className="text-sm text-muted-foreground mb-2">
              Add the secret token to the URL hash fragment like this:
            </p>
            <code className="block bg-muted p-3 rounded text-xs break-all">
              {exampleUrl}
            </code>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Step 3: Sign In</h3>
            <p className="text-sm text-muted-foreground">
              After opening the URL with the token, sign in with Internet Identity. Your principal will 
              automatically be granted admin privileges.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Security Note</h3>
            <p className="text-sm text-muted-foreground">
              The token is stored in your browser session and automatically cleared from the URL to prevent 
              history leakage. Keep your admin token secure and never share it publicly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
