import type { Engine } from "~/lib/engine/Engine";
import type { AplConditionSelectBase } from "~/app/apl/types";

export function buildAplCondEnemyDoesntHaveModifier(
  engine: Engine,
  modifiers: string[],
): AplConditionSelectBase {
  return {
    type: "select",
    id: "enemy_doesnt_have_modifier",
    description: "Enemy doesn't have modifier",
    check: (value: string) =>
      !engine.modifierManager.hasModifierByName(engine.getEnemy(), value),
    options: modifiers,
  };
}
