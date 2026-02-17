export function validateOwnershipSplits(splits: [string, bigint][]): { valid: boolean; error?: string } {
  if (splits.length === 0) {
    return { valid: false, error: 'At least one ownership split is required' };
  }

  const total = splits.reduce((sum, [_, percentage]) => sum + Number(percentage), 0);

  if (total > 100) {
    return { valid: false, error: `Ownership splits total ${total}% which exceeds 100%` };
  }

  if (total < 0) {
    return { valid: false, error: 'Ownership splits cannot be negative' };
  }

  return { valid: true };
}
