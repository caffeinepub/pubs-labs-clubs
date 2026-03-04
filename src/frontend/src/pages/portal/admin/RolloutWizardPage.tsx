import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Circle,
  ListChecks,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import React, { useState } from "react";
import AccessDeniedScreen from "../../../components/auth/AccessDeniedScreen";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { useRolloutWizard } from "../../../hooks/useRolloutWizard";
import RolloutConfirmationDialog from "./RolloutConfirmationDialog";

export default function RolloutWizardPage() {
  const { isAdmin } = useCurrentUser();
  const {
    currentStep,
    currentStepIndex,
    allSteps,
    isFirstStep,
    isLastStep,
    isCurrentStepConfirmed,
    confirmations,
    goToNextStep,
    goToPreviousStep,
    confirmCurrentStep,
    resetWizard,
  } = useRolloutWizard();

  const [dialogOpen, setDialogOpen] = useState(false);

  if (!isAdmin) {
    return <AccessDeniedScreen />;
  }

  const handleNextClick = () => {
    if (currentStep.requiresConfirmation && !isCurrentStepConfirmed) {
      setDialogOpen(true);
    } else {
      goToNextStep();
    }
  };

  const handleDialogConfirm = () => {
    confirmCurrentStep(true);
    setDialogOpen(false);
    goToNextStep();
  };

  const handleDialogCancel = () => {
    setDialogOpen(false);
  };

  const getStepStatus = (
    index: number,
  ): "completed" | "current" | "upcoming" => {
    if (index < currentStepIndex) return "completed";
    if (index === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Rollout Wizard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Step-by-step guide for deploying Higgins Music Hub to the ICP
            mainnet.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={resetWizard}
          className="flex items-center gap-2 flex-shrink-0"
        >
          <RotateCcw size={14} />
          Reset
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Step Progress Sidebar */}
        <aside className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[60vh]">
                <ol className="space-y-1 px-4 pb-4">
                  {allSteps.map((step, index) => {
                    const status = getStepStatus(index);
                    const isConfirmed = !!confirmations[step.id];
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          onClick={() => {
                            // Allow navigating back to completed steps
                            if (status === "completed") {
                              // Navigate back by going to previous steps
                              const diff = currentStepIndex - index;
                              for (let i = 0; i < diff; i++) {
                                goToPreviousStep();
                              }
                            }
                          }}
                          disabled={status === "upcoming"}
                          className={`w-full flex items-start gap-2.5 px-2 py-2 rounded-md text-left text-xs transition-colors ${
                            status === "current"
                              ? "bg-primary/10 text-primary font-medium"
                              : status === "completed"
                                ? "text-muted-foreground hover:bg-muted/50 cursor-pointer"
                                : "text-muted-foreground/50 cursor-default"
                          }`}
                        >
                          <span className="flex-shrink-0 mt-0.5">
                            {status === "completed" ? (
                              <CheckCircle2
                                size={14}
                                className="text-green-500"
                              />
                            ) : status === "current" ? (
                              <Circle
                                size={14}
                                className="text-primary fill-primary/20"
                              />
                            ) : (
                              <Circle
                                size={14}
                                className="text-muted-foreground/30"
                              />
                            )}
                          </span>
                          <span className="leading-tight">
                            {step.title.split(" — ")[0]}
                          </span>
                          {status === "completed" &&
                            isConfirmed &&
                            step.requiresConfirmation && (
                              <ShieldCheck
                                size={12}
                                className="flex-shrink-0 mt-0.5 text-green-500 ml-auto"
                              />
                            )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </ScrollArea>
            </CardContent>
          </Card>
        </aside>

        {/* Main Step Content */}
        <main className="lg:col-span-3 space-y-4">
          {/* Step Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-1">
                <Badge variant="outline" className="text-xs font-mono">
                  {currentStepIndex + 1} / {allSteps.length}
                </Badge>
                {currentStep.requiresConfirmation && (
                  <Badge
                    variant={isCurrentStepConfirmed ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {isCurrentStepConfirmed
                      ? "✓ Confirmed"
                      : "Requires Confirmation"}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl">{currentStep.title}</CardTitle>
              <CardDescription className="text-sm leading-relaxed">
                {currentStep.description}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Gate / Pre-conditions */}
          {currentStep.gateLabel &&
            currentStep.gateItems &&
            currentStep.gateItems.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    {currentStep.gateLabel}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentStep.gateItems.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="flex-shrink-0 mt-1 w-4 h-4 rounded border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-xs text-amber-600 dark:text-amber-400">
                          ☐
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  {currentStep.warningNote && (
                    <Alert className="mt-3 border-amber-500/30 bg-amber-500/10">
                      <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                        {currentStep.warningNote}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

          {/* Action Checklist */}
          {currentStep.actionItems && currentStep.actionItems.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <ListChecks size={16} className="text-primary" />
                  Action Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2">
                  {currentStep.actionItems.map((item, idx) => (
                    <li
                      key={item}
                      className="flex items-start gap-3 text-sm text-foreground/80"
                    >
                      <span className="flex-shrink-0 w-5 h-5 rounded-full border border-border bg-muted flex items-center justify-center text-xs font-mono text-muted-foreground mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{item}</span>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Acceptance Criteria */}
          {currentStep.acceptanceCriteria &&
            currentStep.acceptanceCriteria.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Acceptance Criteria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {currentStep.acceptanceCriteria.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex items-start gap-2 text-sm text-foreground/80"
                      >
                        <span className="flex-shrink-0 mt-1 text-green-500">
                          <CheckCircle2 size={13} />
                        </span>
                        <span>{criterion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

          {/* Confirmation status for current step */}
          {currentStep.requiresConfirmation && (
            <Card
              className={
                isCurrentStepConfirmed
                  ? "border-green-500/30 bg-green-500/5"
                  : "border-primary/30 bg-primary/5"
              }
            >
              <CardContent className="pt-4 pb-4">
                {isCurrentStepConfirmed ? (
                  <div className="flex items-center gap-3 text-sm text-green-600 dark:text-green-400">
                    <ShieldCheck size={18} />
                    <span className="font-medium">
                      This step has been confirmed. You may proceed to the next
                      step.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-sm text-primary">
                    <AlertTriangle size={18} />
                    <span>
                      You must confirm this step before proceeding. Click{" "}
                      <strong>Next Step</strong> to open the confirmation
                      prompt.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              onClick={goToPreviousStep}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ChevronLeft size={16} />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              Step {currentStepIndex + 1} of {allSteps.length}
            </span>

            {isLastStep ? (
              <Button
                variant="outline"
                onClick={resetWizard}
                className="flex items-center gap-2"
              >
                <RotateCcw size={16} />
                Start Over
              </Button>
            ) : (
              <Button
                onClick={handleNextClick}
                disabled={isLastStep}
                className="flex items-center gap-2"
              >
                {currentStep.requiresConfirmation && !isCurrentStepConfirmed
                  ? "Confirm & Next"
                  : "Next Step"}
                <ChevronRight size={16} />
              </Button>
            )}
          </div>
        </main>
      </div>

      {/* Confirmation Dialog */}
      {currentStep.requiresConfirmation && currentStep.confirmationText && (
        <RolloutConfirmationDialog
          open={dialogOpen}
          title={`Confirm: ${currentStep.title.split(" — ")[0]}`}
          description={`Before proceeding to the next step, please confirm that all requirements for ${currentStep.title.split(" — ")[0]} have been met.`}
          confirmationText={currentStep.confirmationText}
          onConfirm={handleDialogConfirm}
          onCancel={handleDialogCancel}
        />
      )}
    </div>
  );
}
