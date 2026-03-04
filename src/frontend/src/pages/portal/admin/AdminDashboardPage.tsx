import { Skeleton } from "@/components/ui/skeleton";
import { Disc, FileText, Mic, TrendingUp, Users } from "lucide-react";
import React from "react";
import type { T as MemberStatus, ProjectStatus } from "../../../backend";
import AccessDeniedScreen from "../../../components/auth/AccessDeniedScreen";
import AnalyticsBarChart from "../../../components/dashboard/AnalyticsBarChart";
import AnalyticsPieChart from "../../../components/dashboard/AnalyticsPieChart";
import StatCard from "../../../components/dashboard/StatCard";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useGetDashboardStats } from "../../../hooks/useQueries";

function memberStatusLabel(status: MemberStatus): string {
  switch (status) {
    case "applicant":
      return "Applicant";
    case "active":
      return "Active";
    case "paused":
      return "Paused";
    case "inactive":
      return "Inactive";
    default:
      return String(status);
  }
}

function projectStatusLabel(status: ProjectStatus): string {
  switch (status) {
    case "in_progress":
      return "In Progress";
    case "completed":
      return "Completed";
    case "planned":
      return "Planned";
    case "archived":
      return "Archived";
    default:
      return String(status);
  }
}

export default function AdminDashboardPage() {
  const { isAdmin } = useCurrentUser();
  const { data: stats, isLoading, isError } = useGetDashboardStats();

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const membershipStatusData = stats
    ? stats.membershipStatusCounts.map(([status, count]) => ({
        label: memberStatusLabel(status),
        value: Number(count),
      }))
    : [];

  const releaseTypeData = stats
    ? stats.releaseTypeCounts.map(([type, count]) => ({
        label: type,
        value: Number(count),
      }))
    : [];

  const projectStatusData = stats
    ? stats.projectStatusCounts.map(([status, count]) => ({
        label: projectStatusLabel(status),
        value: Number(count),
      }))
    : [];

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Overview of all entities and analytics across the platform.
        </p>
      </div>

      {/* Stat Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[
            "memberships",
            "publishing",
            "releases",
            "recordings",
            "artists",
          ].map((k) => (
            <Skeleton key={k} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load dashboard statistics. Please try again.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            title="Memberships"
            value={stats?.totalMemberships ?? BigInt(0)}
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Publishing Works"
            value={stats?.totalPublishingWorks ?? BigInt(0)}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Releases"
            value={stats?.totalReleases ?? BigInt(0)}
            icon={<Disc className="h-5 w-5" />}
          />
          <StatCard
            title="Recording Projects"
            value={stats?.totalRecordingProjects ?? BigInt(0)}
            icon={<Mic className="h-5 w-5" />}
          />
          <StatCard
            title="Artist Development"
            value={stats?.totalArtistDevelopment ?? BigInt(0)}
            icon={<TrendingUp className="h-5 w-5" />}
          />
        </div>
      )}

      {/* Analytics Section */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-foreground">
          Analytics
        </h2>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {["membership-status", "release-type", "project-status"].map(
              (k) => (
                <Skeleton key={k} className="h-64 rounded-xl" />
              ),
            )}
          </div>
        ) : isError ? null : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AnalyticsBarChart
              title="Membership Status Distribution"
              data={membershipStatusData}
              orientation="horizontal"
            />
            <AnalyticsPieChart
              title="Release Type Breakdown"
              data={releaseTypeData}
            />
            <AnalyticsBarChart
              title="Recording Project Status"
              data={projectStatusData}
              orientation="horizontal"
            />
          </div>
        )}
      </div>
    </div>
  );
}
