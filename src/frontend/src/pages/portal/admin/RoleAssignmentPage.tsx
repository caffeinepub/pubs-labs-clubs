import { UserRole } from "@/backend";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAssignRole, useGetAllKnownUsers } from "@/hooks/useQueries";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";

export default function RoleAssignmentPage() {
  const { data: users, isLoading } = useGetAllKnownUsers();
  const assignRole = useAssignRole();
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>(
    {},
  );

  const handleRoleChange = (principalStr: string, role: UserRole) => {
    setPendingRoles((prev) => ({ ...prev, [principalStr]: role }));
  };

  const handleSave = async (principalStr: string) => {
    const newRole = pendingRoles[principalStr];
    if (!newRole) return;
    try {
      await assignRole.mutateAsync({ user: principalStr, role: newRole });
      toast.success("Role updated successfully");
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[principalStr];
        return next;
      });
    } catch (_err) {
      toast.error("Failed to update role");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Role Assignment</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage user roles for all known users.
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Principal</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Current Role</TableHead>
            <TableHead>New Role</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(users ?? []).map((user) => {
            const principalStr = user.principal.toString();
            const currentRole = user.role;
            const pendingRole = pendingRoles[principalStr];

            return (
              <TableRow key={principalStr}>
                <TableCell className="font-mono text-xs max-w-[180px] truncate">
                  {principalStr}
                </TableCell>
                <TableCell>{user.profile?.name ?? "—"}</TableCell>
                <TableCell className="capitalize">{currentRole}</TableCell>
                <TableCell>
                  <Select
                    value={pendingRole ?? currentRole}
                    onValueChange={(val) =>
                      handleRoleChange(principalStr, val as UserRole)
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.guest}>Guest</SelectItem>
                      <SelectItem value={UserRole.user}>User</SelectItem>
                      <SelectItem value={UserRole.admin}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    disabled={
                      !pendingRole ||
                      pendingRole === currentRole ||
                      assignRole.isPending
                    }
                    onClick={() => handleSave(principalStr)}
                  >
                    {assignRole.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Save"
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {(users ?? []).length === 0 && (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-8"
              >
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
