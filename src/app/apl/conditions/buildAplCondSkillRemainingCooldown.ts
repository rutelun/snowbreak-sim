import type { Engine } from "~/lib/engine/Engine";
import type { SkillType } from "~/lib/engine/AttributeManager";
import type { Character } from "~/lib/engine/Character";
import type { AplConditionComparatorBase } from "~/app/apl/types";

export function buildAplCondSkillRemainingCooldown(
  engine: Engine,
  char: Character,
  skillType: SkillType,
): AplConditionComparatorBase {
  return {
    type: "comparator",
    id: `${char.name}_${skillType}_remaining_cooldown`,
    description: `${char.name} ${skillType} remaining cooldown`,
    getValue: () => char.getSkillRemainingCooldown(skillType) / 1_000,
    suffix: "s",
  };
}
