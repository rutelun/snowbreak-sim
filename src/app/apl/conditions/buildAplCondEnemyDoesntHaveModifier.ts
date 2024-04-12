import type { AplConditionSelectBase } from "~/app/apl/types";

export function buildAplCondEnemyDoesntHaveModifier(
  modifiers: string[],
): AplConditionSelectBase {
  return {
    type: "select",
    id: "enemy_doesnt_have_modifier",
    description: "Enemy doesn't have modifier",
    check: (engine, value: string) =>
      !engine.modifierManager.hasModifierByName(engine.getEnemy(), value),
    options: modifiers,
  };
}
