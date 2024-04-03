export type SkillLvl = 0 | 1 | 2 | 3 | 4 | 5;

export function getSkillValueByLevel(
  possibleValues: number | readonly number[],
  skillLvl: SkillLvl,
): number {
  if (!Array.isArray(possibleValues)) {
    return possibleValues as number;
  }

  const index = Math.min(skillLvl, possibleValues.length - 1);
  return possibleValues[index];
}
