import type { Engine } from "~/lib/engine/Engine";
import type { AplConditionSelectBase } from "~/app/apl/types";

export function buildAplCondActiveCharHasModifier(
  engine: Engine,
  modifiers: string[],
): AplConditionSelectBase {
  return {
    type: "select",
    id: "active_char_has_modifier",
    description: "Active char has modifier",
    check: (value: string) =>
      engine.modifierManager.hasModifierByName(
        engine.teamManager.getActiveChar(),
        value,
      ),
    options: modifiers,
  };
}
