import { findingsBySection, type AuditFinding, type AuditPriority } from '@/utils/portalAudit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ClipboardList, Zap, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const SECTION_ORDER = [
  'Memberships',
  'Publishing Works',
  'Releases',
  'Recording Projects',
  'Artist Development',
];

const priorityBadgeVariant: Record<AuditPriority, 'default' | 'secondary' | 'outline'> = {
  high: 'default',
  medium: 'secondary',
  low: 'outline',
};

const priorityIcon: Record<AuditPriority, React.ElementType> = {
  high: Zap,
  medium: AlertTriangle,
  low: Info,
};

const priorityIconClass: Record<AuditPriority, string> = {
  high: 'text-amber-500 dark:text-amber-400',
  medium: 'text-blue-500 dark:text-blue-400',
  low: 'text-muted-foreground',
};

function FindingRow({ finding }: { finding: AuditFinding }) {
  const Icon = priorityIcon[finding.suggestedPriority];
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <Icon className={cn('h-4 w-4 mt-0.5 shrink-0', priorityIconClass[finding.suggestedPriority])} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-0.5">
          <span className="text-sm font-medium text-foreground">{finding.featureDescription}</span>
          <Badge variant={priorityBadgeVariant[finding.suggestedPriority]} className="text-xs capitalize">
            {finding.suggestedPriority}
          </Badge>
        </div>
        {finding.context && (
          <p className="text-xs text-muted-foreground leading-relaxed">{finding.context}</p>
        )}
      </div>
    </div>
  );
}

/**
 * Admin-only component that displays a comprehensive summary of all identified
 * empty or incomplete portal sections, grouped by section with priority indicators.
 */
export default function PortalAuditSummary() {
  const grouped = findingsBySection();
  const totalFindings = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  const highCount = Object.values(grouped)
    .flat()
    .filter((f) => f.suggestedPriority === 'high').length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-5 w-5 text-muted-foreground" />
        <div>
          <h2 className="text-xl font-bold">Portal Development Priorities</h2>
          <p className="text-sm text-muted-foreground">
            {totalFindings} identified gaps across 5 portal sections —{' '}
            <span className="font-medium text-amber-600 dark:text-amber-400">
              {highCount} high priority
            </span>
            . Use this list to decide the build order.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {SECTION_ORDER.map((sectionName) => {
          const findings = grouped[sectionName] ?? [];
          if (findings.length === 0) return null;
          const highPriority = findings.filter((f) => f.suggestedPriority === 'high').length;
          return (
            <Card key={sectionName} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{sectionName}</CardTitle>
                  <div className="flex gap-1">
                    {highPriority > 0 && (
                      <Badge variant="default" className="text-xs">
                        {highPriority} high
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {findings.length} total
                    </Badge>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {findings.filter((f) => f.suggestedPriority === 'high').length > 0
                    ? 'Has high-priority gaps — recommended to address soon.'
                    : 'No high-priority gaps — medium/low items pending.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                {findings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} />
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
