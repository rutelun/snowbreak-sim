import type { AplAction } from "~/lib/apl/types";
import type { Character } from "~/lib/engine/Character";
import type { SkillType } from "~/lib/engine/AttributeManager";

export function useSkillIfPossibleBuilder(
  char: Character,
  skillTypes: SkillType[],
): AplAction[] {
  return skillTypes.map((skillType) => ({
    name: `${char.name}: use ${skillType}`,
    disabled: false,
    canPerformAction: () => char.canUseSkill(skillType),
    action: () => char.useSkill(skillType),
  }));
}
