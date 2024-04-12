import type { SkillType } from "~/lib/engine/AttributeManager";
import type { AplConditionComparatorBase } from "~/app/apl/types";
import type { FullCharInfo } from "~/app/components/Pickers/types";

export function buildAplCondSkillRemainingCooldown(
  char: FullCharInfo,
  skillType: SkillType,
): AplConditionComparatorBase {
  return {
    type: "comparator",
    id: `${char.char?.id}_${skillType}_remaining_cooldown`,
    description: `${char.char?.id} ${skillType} remaining cooldown`,
    getValue: (engine) =>
      engine.teamManager
        .getCharById(char.char?.id)
        .getSkillRemainingCooldown(skillType) / 1_000,
    suffix: "s",
  };
}
