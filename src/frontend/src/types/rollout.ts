export interface RolloutStep {
  id: string;
  title: string;
  description: string;
  requiresConfirmation: boolean;
  confirmationText?: string;
  gateLabel?: string;
  gateItems?: string[];
  actionItems?: string[];
  acceptanceCriteria?: string[];
  evidenceFields?: string[];
  warningNote?: string;
}

export interface RolloutWizardState {
  currentStepIndex: number;
  steps: RolloutStep[];
  confirmations: Record<string, boolean>;
}
