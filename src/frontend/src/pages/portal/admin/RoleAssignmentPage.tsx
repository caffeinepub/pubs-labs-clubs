import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { useGetAllKnownUsers, useAssignUserRole } from '../../../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Shield, User as UserIcon } from 'lucide-react';
import LoadingState from '../../../components/feedback/LoadingState';
import { UserRole } from '../../../backend';
import { useState } from 'react';

export default function RoleAssignmentPage() {
  const { isAdmin, isLoading: userLoading } = useCurrentUser();
  const { data: users, isLoading: usersLoading } = useGetAllKnownUsers();
  const assignRole = useAssignUserRole();
  const [changingRole, setChangingRole] = useState<string | null>(null);

  if (userLoading || usersLoading) {
    return <LoadingState />;
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only administrators can access this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleRoleChange = async (principalString: string, newRole: UserRole) => {
    setChangingRole(principalString);
    try {
      await assignRole.mutateAsync({
        principal: principalString,
        role: newRole
      });
    } finally {
      setChangingRole(null);
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case UserRole.admin:
        return 'default';
      case UserRole.user:
        return 'secondary';
      case UserRole.guest:
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case UserRole.admin:
        return 'Admin';
      case UserRole.user:
        return 'Member';
      case UserRole.guest:
        return 'Guest';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Role Assignment</h1>
        <p className="text-muted-foreground mt-2">
          Manage user roles and permissions for the Higgins Music platform.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Important: Authentication vs. Admin Access</AlertTitle>
        <AlertDescription>
          When someone signs in with Internet Identity and accepts the permission request, they are only <strong>authenticated</strong>.
          This does not automatically grant them Admin privileges. Admin access must be explicitly assigned by an existing administrator using this page.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          <CardDescription>
            View all signed-in users and manage their role assignments. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <UserIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No users have signed in yet.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Principal ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Current Role</TableHead>
                    <TableHead>Assign Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => {
                    const principalString = user.principal.toString();
                    const isChanging = changingRole === principalString;
                    
                    return (
                      <TableRow key={principalString}>
                        <TableCell className="font-mono text-xs max-w-[200px] truncate" title={principalString}>
                          {principalString}
                        </TableCell>
                        <TableCell>
                          {user.profile ? user.profile.name : <span className="text-muted-foreground italic">No profile</span>}
                        </TableCell>
                        <TableCell>
                          {user.profile ? user.profile.email : <span className="text-muted-foreground italic">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {user.role === UserRole.admin && <Shield className="h-3 w-3 mr-1" />}
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.role}
                            onValueChange={(value) => handleRoleChange(principalString, value as UserRole)}
                            disabled={isChanging}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserRole.admin}>Admin</SelectItem>
                              <SelectItem value={UserRole.user}>Member</SelectItem>
                              <SelectItem value={UserRole.guest}>Guest</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
