import { UserRole } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useAssignRole, useGetAllKnownUsers } from "@/hooks/useQueries";
import { CheckCircle2, Copy, Loader2, Search, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function roleBadge(role: UserRole) {
  if (role === UserRole.admin) {
    return (
      <Badge className="bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700 capitalize">
        Admin
      </Badge>
    );
  }
  if (role === UserRole.user) {
    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700 capitalize">
        User
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="capitalize text-muted-foreground">
      Guest
    </Badge>
  );
}

export default function RoleAssignmentPage() {
  const { data: users, isLoading } = useGetAllKnownUsers();
  const assignRole = useAssignRole();
  const { identity } = useInternetIdentity();
  const currentPrincipal = identity?.getPrincipal().toString();

  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>(
    {},
  );
  const [search, setSearch] = useState("");
  const [copiedPrincipal, setCopiedPrincipal] = useState<string | null>(null);

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

  const handleCopyPrincipal = async (principalStr: string) => {
    try {
      await navigator.clipboard.writeText(principalStr);
      setCopiedPrincipal(principalStr);
      toast.success("Principal copied");
      setTimeout(() => setCopiedPrincipal(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const allUsers = users ?? [];
  const filtered = search.trim()
    ? allUsers.filter((u) => {
        const q = search.toLowerCase();
        const p = u.principal.toString().toLowerCase();
        const n = (u.profile?.name ?? "").toLowerCase();
        return p.includes(q) || n.includes(q);
      })
    : allUsers;

  if (isLoading) {
    return (
      <div
        data-ocid="roles.loading_state"
        className="flex items-center justify-center py-12"
      >
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Role Assignment</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage access levels for all registered users.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-1.5">
          <Users className="h-4 w-4" />
          <span>
            {allUsers.length} {allUsers.length === 1 ? "user" : "users"}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          data-ocid="roles.search_input"
          placeholder="Search by name or principal…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table data-ocid="roles.table">
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Principal</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Current Role</TableHead>
              <TableHead>Assign Role</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((user, idx) => {
              const principalStr = user.principal.toString();
              const currentRole = user.role;
              const pendingRole = pendingRoles[principalStr];
              const isMe = principalStr === currentPrincipal;
              const isCopied = copiedPrincipal === principalStr;
              const rowIdx = idx + 1;

              return (
                <TableRow
                  key={principalStr}
                  data-ocid={`roles.row.${rowIdx}`}
                  className={isMe ? "bg-primary/5" : undefined}
                >
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs text-muted-foreground max-w-[140px] truncate block">
                        {principalStr}
                      </span>
                      <Button
                        data-ocid={`roles.copy_button.${rowIdx}`}
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleCopyPrincipal(principalStr)}
                        title="Copy full principal ID"
                      >
                        {isCopied ? (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>{user.profile?.name ?? "—"}</span>
                      {isMe && (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700 text-xs">
                          You
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{roleBadge(currentRole)}</TableCell>
                  <TableCell>
                    <Select
                      value={pendingRole ?? currentRole}
                      onValueChange={(val) =>
                        handleRoleChange(principalStr, val as UserRole)
                      }
                    >
                      <SelectTrigger
                        data-ocid={`roles.select.${rowIdx}`}
                        className="w-32"
                      >
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
                      data-ocid={`roles.save_button.${rowIdx}`}
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
            {filtered.length === 0 && (
              <TableRow>
                <TableCell
                  data-ocid="roles.empty_state"
                  colSpan={5}
                  className="text-center text-muted-foreground py-12"
                >
                  {search ? (
                    <span>
                      No users match <strong>{search}</strong>.
                    </span>
                  ) : (
                    "No users found."
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
