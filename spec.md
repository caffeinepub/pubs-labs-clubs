# Specification

## Summary
**Goal:** Split the existing "Part 5" step in the onboarding/rollout wizard into two sequential sub-steps (Part 5a and Part 5b), each with its own screen and explicit confirmation prompt.

**Planned changes:**
- Divide Part 5 into two distinct sub-steps: Part 5a and Part 5b
- Each sub-step gets its own dedicated screen with a title and description of the action to be performed
- Add a confirmation prompt before Part 5a that the user must acknowledge before proceeding
- Add a second confirmation prompt before Part 5b that the user must acknowledge before proceeding
- Disable the "Continue"/"Proceed" button until the user confirms at each sub-step
- Update the step indicator/progress tracker to reflect both sub-steps
- Cancelling or declining a confirmation returns the user to the previous state without advancing

**User-visible outcome:** Users going through the rollout/onboarding wizard will encounter Part 5 as two separate confirmed steps (5a and 5b), each requiring an explicit acknowledgement before moving forward, preventing accidental advancement through critical upgrade actions.
