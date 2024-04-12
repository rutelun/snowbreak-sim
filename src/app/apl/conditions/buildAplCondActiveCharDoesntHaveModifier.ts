import type { AplConditionSelectBase } from "~/app/apl/types";

export function buildAplCondActiveCharDoesntHaveModifier(
  modifiers: string[],
): AplConditionSelectBase {
  return {
    type: "select",
    id: "active_char_doesnt_have_modifier",
    description: "Active char doesn't have modifier",
    check: (engine, value: string) =>
      !engine.modifierManager.hasModifierByName(
        engine.teamManager.getActiveChar(),
        value,
      ),
    options: modifiers,
  };
}
