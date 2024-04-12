import type { Engine } from "~/lib/engine/Engine";
import type { AplConditionSelectBase } from "~/app/apl/types";

export function buildAplCondEnemyHasModifier(
  modifiers: string[],
): AplConditionSelectBase {
  return {
    type: "select",
    id: "enemy_has_modifier",
    description: "Enemy has modifier",
    check: (engine: Engine, value: string) =>
      engine.modifierManager.hasModifierByName(engine.getEnemy(), value),
    options: modifiers,
  };
}
