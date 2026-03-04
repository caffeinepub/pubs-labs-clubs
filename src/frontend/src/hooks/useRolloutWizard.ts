import { useCallback, useState } from "react";
import type { RolloutStep, RolloutWizardState } from "../types/rollout";

const ROLLOUT_STEPS: RolloutStep[] = [
  {
    id: "step-10a",
    title: "Step 10A — Pre-Deployment Checks & Canister Preparation",
    description:
      "Verify the local build is clean, confirm the correct dfx identity and cycles wallet are configured for mainnet, and prepare the backend canister for upgrade on the ICP mainnet.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm all Step 10A pre-deployment checks have passed and I am ready to proceed to the backend canister upgrade.",
    gateLabel: "⚠️ Before You Begin — Confirmation Checklist",
    gateItems: [
      "Local TypeScript check passes (pnpm typescript-check exits with zero errors)",
      "Local production build succeeds (pnpm build completes without errors)",
      "Correct dfx identity is set for mainnet deployment (dfx identity whoami returns the expected deployer identity)",
      "Mainnet cycles wallet is funded with sufficient cycles for canister upgrade and frontend asset upload",
      "Mainnet backend canister ID is recorded and confirmed",
      "Previous smoke test results (SMOKE_TEST_21_7_SESSION_LOG.md) have been reviewed",
      "No outstanding critical bugs or regressions are known in the current codebase",
    ],
    actionItems: [
      "Run pnpm typescript-check and confirm zero TypeScript errors",
      "Run pnpm build and confirm the production build completes successfully",
      "Run dfx identity whoami and confirm the correct mainnet deployer identity is active",
      "Run dfx identity get-wallet --network ic and confirm the cycles wallet address is correct",
      "Verify cycles balance is sufficient: dfx wallet balance --network ic",
      "Confirm the mainnet backend canister ID: dfx canister id backend --network ic",
      "Record the current canister status: dfx canister status backend --network ic",
      "Confirm the canister is in a Running state and not frozen",
      "Review backend/main.mo for any last-minute issues before upgrade",
      "Document the pre-deployment canister module hash for rollback reference",
    ],
    acceptanceCriteria: [
      "Local TypeScript check passes with zero errors",
      "Local production build succeeds without errors",
      "Correct dfx identity is active for mainnet deployment",
      "Cycles wallet is funded and confirmed",
      "Mainnet backend canister ID is verified and recorded",
      "Canister is in Running state",
      "Pre-deployment module hash is documented",
    ],
    warningNote:
      "Stop here if any item above cannot be confirmed. Resolve all failures before continuing.",
  },
  {
    id: "step-10b",
    title: "Step 10B — Backend Canister Upgrade on Mainnet",
    description:
      "Upgrade the backend canister on the ICP mainnet, verify the upgrade completed successfully, and run a backend-focused smoke test to confirm stable memory and data integrity.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm all Step 10A criteria are met and I am ready to execute the backend canister upgrade on mainnet.",
    gateLabel: "🔒 Gate: Confirm 10A Complete",
    gateItems: [
      "Local TypeScript check passed with zero errors (Step 10A ✓)",
      "Local production build succeeded without errors (Step 10A ✓)",
      "Correct dfx identity is active for mainnet deployment (Step 10A ✓)",
      "Cycles wallet is funded and confirmed (Step 10A ✓)",
      "Mainnet backend canister ID is verified and recorded (Step 10A ✓)",
      "Canister was confirmed in Running state (Step 10A ✓)",
      "Pre-deployment module hash is documented for rollback reference (Step 10A ✓)",
      "Step 10A smoke test (SMOKE_TEST_STEP_10_MAINNET.md — Section 10A) passed",
    ],
    actionItems: [
      "Run the backend canister upgrade: dfx deploy backend --network ic --mode upgrade",
      "Confirm the upgrade command exits with a success status (no error output)",
      "Record the new post-upgrade module hash: dfx canister status backend --network ic",
      "Confirm the canister is still in Running state after upgrade",
      "Verify stable memory was preserved (no data loss) by querying a known entity from the backend",
      "Run a backend query smoke test: call getEntitiesForCaller via the admin principal and confirm data is returned",
      "Confirm isCallerAdmin returns true for the admin principal",
      "Confirm isCallerApproved returns true for a known approved non-admin member",
      "Check canister logs for any traps or unexpected errors: dfx canister logs backend --network ic",
      "Document the upgrade outcome and any warnings observed",
    ],
    acceptanceCriteria: [
      "Backend canister upgrade completes without errors",
      "Canister remains in Running state after upgrade",
      "Post-upgrade module hash is recorded",
      "Stable memory is preserved — existing entities are queryable",
      "isCallerAdmin returns correct results for admin principal",
      "isCallerApproved returns correct results for approved member",
      "No traps or critical errors in canister logs",
    ],
    warningNote:
      "Stop here if any condition above is not confirmed. Do not upgrade the backend canister until all Step 10A criteria are met.",
  },
  {
    id: "step-10c",
    title: "Step 10C — Frontend Canister Upgrade",
    description:
      "Deploy the compiled frontend assets to the ICP mainnet frontend canister, verify the deployment completed successfully, and run a full post-deployment smoke test covering all five portal detail routes, Edit Links dialogs for both admin and non-admin roles, and AuthGate/ApprovalGate behavior.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm all Step 10B criteria are met and I am ready to proceed to the frontend canister upgrade preparation.",
    gateLabel: "🔒 Gate: Confirm 10B Complete",
    gateItems: [
      "Backend canister upgrade completed without errors (Step 10B ✓)",
      "Canister is in Running state after upgrade (Step 10B ✓)",
      "Post-upgrade module hash is recorded (Step 10B ✓)",
      "Stable memory verified — existing entities are queryable (Step 10B ✓)",
      "isCallerAdmin and isCallerApproved return correct results (Step 10B ✓)",
      "No traps or critical errors found in canister logs (Step 10B ✓)",
      "Step 10B smoke test (SMOKE_TEST_STEP_10_MAINNET.md — Section 10B) passed",
    ],
    actionItems: [],
    acceptanceCriteria: [],
    warningNote:
      "Stop here if any condition above is not confirmed. Do not deploy frontend assets until the backend upgrade is verified stable.",
  },
  {
    id: "step-10c-i",
    title: "Step 10C-i — Frontend Build Verification",
    description:
      "Verify the frontend production build is clean and all assets are ready for deployment to the ICP mainnet frontend canister. This is the preparation phase before executing the actual deployment command.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm the frontend build is clean, all assets are verified, and I am ready to execute the frontend canister deployment to mainnet.",
    gateLabel: "🔒 Gate: Confirm 10C Pre-conditions",
    gateItems: [
      "Step 10B backend upgrade is confirmed stable (Step 10B ✓)",
      "Step 10C gate conditions are all confirmed (Step 10C ✓)",
      "No new code changes have been made since the last verified build",
    ],
    actionItems: [
      "Run pnpm typescript-check one final time to confirm zero TypeScript errors",
      "Run pnpm build to produce a fresh production build",
      "Inspect the dist/ output directory to confirm all expected asset files are present",
      "Verify the env.json file is present in the dist/ directory",
      "Confirm the frontend canister ID: dfx canister id frontend --network ic",
      "Record the current frontend canister module hash before upgrade: dfx canister status frontend --network ic",
      "Confirm the frontend canister is in a Running state",
      "Review the build output for any warnings that could affect runtime behaviour",
    ],
    acceptanceCriteria: [
      "TypeScript check passes with zero errors on the final build",
      "Production build completes without errors",
      "All expected dist/ assets are present",
      "env.json is present in the dist/ directory",
      "Frontend canister ID is confirmed",
      "Pre-upgrade frontend canister module hash is recorded",
      "Frontend canister is in Running state",
    ],
    warningNote:
      "Do not proceed to the deployment command (Step 10C-ii) if the build fails or any asset is missing.",
  },
  {
    id: "step-10c-ii",
    title: "Step 10C-ii — Frontend Canister Deployment & Smoke Test",
    description:
      "Execute the frontend canister deployment command to push the compiled assets to the ICP mainnet, verify the deployment completed successfully, and run the full post-deployment smoke test covering all five portal detail routes, Edit Links dialogs for both admin and non-admin roles, and AuthGate/ApprovalGate behavior.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm the frontend build verification (Step 10C-i) passed and I am ready to deploy the frontend canister to mainnet and run the smoke test.",
    gateLabel: "🔒 Gate: Confirm 10C-i Complete",
    gateItems: [
      "TypeScript check passed with zero errors (Step 10C-i ✓)",
      "Production build completed without errors (Step 10C-i ✓)",
      "All expected dist/ assets are present (Step 10C-i ✓)",
      "env.json is present in the dist/ directory (Step 10C-i ✓)",
      "Frontend canister ID is confirmed (Step 10C-i ✓)",
      "Pre-upgrade frontend canister module hash is recorded (Step 10C-i ✓)",
      "Frontend canister is in Running state (Step 10C-i ✓)",
    ],
    actionItems: [
      "Run the frontend canister deployment: dfx deploy --network=ic frontend",
      "Confirm the deployment command exits with a success status (no error output)",
      "Record the new post-deployment frontend canister module hash: dfx canister status frontend --network ic",
      "Open the mainnet frontend URL in a browser and confirm the landing page loads",
      "Verify Internet Identity login works correctly",
      "Confirm AuthGate redirects unauthenticated users to the landing page",
      "Confirm ApprovalGate shows the approval banner for non-approved users",
      "Test all five portal detail routes load without crashes for admin role",
      "Test all five portal detail routes load without crashes for non-admin approved member role",
      "Open the Edit Links dialog on each of the five detail routes and confirm it opens and saves correctly",
      "Review the browser console for any undefined/null access errors or critical warnings",
      "Run the full smoke test: SMOKE_TEST_STEP_10C_MAINNET.md",
      "Document the deployment outcome and smoke test results",
    ],
    acceptanceCriteria: [
      "Frontend canister deployment completes without errors",
      "Post-deployment frontend canister module hash is recorded",
      "Landing page loads correctly on mainnet",
      "Internet Identity login and logout work correctly",
      "AuthGate correctly blocks unauthenticated access",
      "ApprovalGate correctly shows approval banner for pending users",
      "All five portal detail routes load without crashes for both roles",
      "Edit Links dialogs open, save, and persist correctly for both roles",
      "No critical errors or undefined/null access errors in the browser console",
      "Full smoke test (SMOKE_TEST_STEP_10C_MAINNET.md) passes",
    ],
    warningNote:
      "If the deployment fails or the smoke test reveals critical issues, assess rollback options before continuing.",
  },
  {
    id: "step-11",
    title: "Step 11 — Post-Launch Refinements",
    description:
      "Incorporate user feedback to improve UX and performance. Fix remaining bugs and issues. Integrate a CI/CD pipeline for automated builds and deployments. This step begins after the mainnet deployment (Step 10C-ii) has been verified stable.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm the mainnet deployment (Step 10C-ii) smoke test passed, the system is live and stable, and I am ready to begin post-launch refinements.",
    gateLabel: "🔒 Gate: Confirm 10C-ii Complete",
    gateItems: [
      "Frontend canister deployment completed without errors (Step 10C-ii ✓)",
      "Post-deployment frontend canister module hash is recorded (Step 10C-ii ✓)",
      "Landing page loads correctly on mainnet (Step 10C-ii ✓)",
      "Internet Identity login and logout work correctly (Step 10C-ii ✓)",
      "All five portal detail routes load without crashes for both roles (Step 10C-ii ✓)",
      "Edit Links dialogs open, save, and persist correctly for both roles (Step 10C-ii ✓)",
      "Full smoke test (SMOKE_TEST_STEP_10C_MAINNET.md) passed (Step 10C-ii ✓)",
      "No critical errors or undefined/null access errors in the browser console (Step 10C-ii ✓)",
    ],
    actionItems: [
      "Collect and triage user feedback from initial mainnet usage (use a shared feedback log or issue tracker)",
      "Prioritise and fix any bugs or regressions identified post-launch",
      "Improve UX based on feedback (navigation, forms, error messages, loading states)",
      "Review and optimise React Query cache invalidation and loading state patterns",
      "Audit the portal for accessibility issues (keyboard navigation, ARIA labels, colour contrast)",
      "Set up a CI/CD pipeline for automated TypeScript checks and production builds",
      "Configure automated deployment to the ICP mainnet on merge to main branch",
      "Add automated smoke test steps to the CI/CD pipeline",
      "Review and update ROLLOUT_STEPS.md and related documentation to reflect the live state",
      "Document any known limitations or deferred improvements in a backlog",
      "Communicate the live launch status to all stakeholders",
    ],
    acceptanceCriteria: [
      "Critical post-launch bugs are identified and resolved",
      "User feedback is collected, triaged, and prioritised",
      "UX improvements based on initial feedback are implemented",
      "CI/CD pipeline is operational and triggers on code changes",
      "Automated deployment to mainnet is configured and tested",
      "Documentation is updated to reflect the current live state",
      "Known limitations and deferred improvements are recorded in a backlog",
    ],
    warningNote:
      "Do not mark this step complete until at least one full feedback cycle has been completed and critical bugs are resolved.",
  },
  {
    id: "step-12",
    title: "Step 12 — Long-Term Maintenance",
    description:
      "Plan and implement system maintenance procedures. Add improvements as needed. Train core team on system maintenance. Maintain documentation and change logs. Establish a regular review cadence for security, dependency updates, and canister health.",
    requiresConfirmation: true,
    confirmationText:
      "I confirm Step 11 post-launch refinements are complete, the CI/CD pipeline is operational, and I am ready to transition to long-term maintenance mode.",
    gateLabel: "🔒 Gate: Confirm Step 11 Complete",
    gateItems: [
      "Critical post-launch bugs are resolved (Step 11 ✓)",
      "User feedback has been collected, triaged, and prioritised (Step 11 ✓)",
      "CI/CD pipeline is operational and triggers on code changes (Step 11 ✓)",
      "Automated deployment to mainnet is configured and tested (Step 11 ✓)",
      "Documentation is updated to reflect the current live state (Step 11 ✓)",
      "Known limitations and deferred improvements are recorded in a backlog (Step 11 ✓)",
    ],
    actionItems: [
      "Define and document canister upgrade procedures (backend and frontend) for the core team",
      "Document the rollback procedure in case of a failed canister upgrade",
      "Train core team members on the deployment and upgrade processes using ROLLOUT_STEPS.md",
      "Establish a regular review cadence (e.g., monthly) for security and dependency updates",
      "Set up canister cycle monitoring and alerts to prevent canister freezing",
      "Review and top up cycles wallets on a regular schedule",
      "Maintain and update ROLLOUT_STEPS.md, smoke test checklists, and related documentation after each upgrade",
      "Plan and implement feature improvements based on the long-term product roadmap",
      "Conduct periodic data integrity checks on the backend canister stable memory",
      "Review access control and approval lists quarterly to ensure correct role assignments",
      "Archive completed rollout documentation and session logs for audit purposes",
      "Establish a process for onboarding new admin team members",
    ],
    acceptanceCriteria: [
      "Canister upgrade and rollback procedures are documented and accessible to the core team",
      "Core team is trained on deployment, upgrade, and rollback processes",
      "Cycle monitoring and top-up procedures are in place",
      "Regular security and dependency review cadence is established",
      "Documentation (ROLLOUT_STEPS.md, smoke tests, change logs) is kept up to date after each change",
      "Feature backlog is maintained and reviewed on a regular cadence",
      "Data integrity check process is defined and scheduled",
      "Access control and role assignment review process is established",
    ],
    warningNote:
      "Long-term maintenance is an ongoing responsibility. Ensure at least two team members are trained on all procedures before considering this step complete.",
  },
];

export function useRolloutWizard() {
  const [state, setState] = useState<RolloutWizardState>({
    currentStepIndex: 0,
    steps: ROLLOUT_STEPS,
    confirmations: {},
  });

  const currentStep = state.steps[state.currentStepIndex];
  const allSteps = state.steps;
  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === state.steps.length - 1;

  const isCurrentStepConfirmed = currentStep.requiresConfirmation
    ? !!state.confirmations[currentStep.id]
    : true;

  const canProceed = isCurrentStepConfirmed && !isLastStep;

  const goToNextStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex < prev.steps.length - 1) {
        return { ...prev, currentStepIndex: prev.currentStepIndex + 1 };
      }
      return prev;
    });
  }, []);

  const goToPreviousStep = useCallback(() => {
    setState((prev) => {
      if (prev.currentStepIndex > 0) {
        return { ...prev, currentStepIndex: prev.currentStepIndex - 1 };
      }
      return prev;
    });
  }, []);

  const confirmCurrentStep = useCallback((confirmed: boolean) => {
    setState((prev) => ({
      ...prev,
      confirmations: {
        ...prev.confirmations,
        [prev.steps[prev.currentStepIndex].id]: confirmed,
      },
    }));
  }, []);

  const resetWizard = useCallback(() => {
    setState({
      currentStepIndex: 0,
      steps: ROLLOUT_STEPS,
      confirmations: {},
    });
  }, []);

  return {
    currentStep,
    currentStepIndex: state.currentStepIndex,
    allSteps,
    canProceed,
    isFirstStep,
    isLastStep,
    isCurrentStepConfirmed,
    confirmations: state.confirmations,
    goToNextStep,
    goToPreviousStep,
    confirmCurrentStep,
    resetWizard,
  };
}
