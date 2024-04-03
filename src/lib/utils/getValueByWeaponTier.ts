export type Tier = 1 | 2 | 3 | 4 | 5;

export function getValueByWeaponTier(
  possibleValues: number | readonly number[],
  tier: Tier,
): number {
  if (!Array.isArray(possibleValues)) {
    return possibleValues as number;
  }

  const index = Math.min(tier - 1, possibleValues.length - 1);
  return possibleValues[index];
}
