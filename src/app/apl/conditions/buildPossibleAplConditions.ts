import type { Engine } from "~/lib/engine/Engine";
import { getEnemyModifiersForChar } from "~/app/apl/conditions/getEnemyModifiersForChar";
import { getActiveCharModifiersForChar } from "~/app/apl/conditions/getActiveCharModifiersForChar";
import type { AplConditionBase } from "~/app/apl/types";
import { buildAplCondEnemyHasModifier } from "~/app/apl/conditions/buildAplCondEnemyHasModifier";
import { buildAplCondSkillRemainingCooldown } from "~/app/apl/conditions/buildAplCondSkillRemainingCooldown";
import { buildAplCondActiveCharHasModifier } from "~/app/apl/conditions/buildAplCondActiveCharHasModifier";
import { getPossibleSkillsForChar } from "~/app/apl/getPossibleSkillsForChar";
import { buildAplCondEnemyDoesntHaveModifier } from "~/app/apl/conditions/buildAplCondEnemyDoesntHaveModifier";
import { buildAplCondActiveCharDoesntHaveModifier } from "~/app/apl/conditions/buildAplCondActiveCharDoesntHaveModifier";

export function buildPossibleAplConditions(engine: Engine): AplConditionBase[] {
  const chars = engine.teamManager.getTeam();
  const enemyModifiers: string[] = [];
  const activeCharModifiers: string[] = [];
  chars.forEach((char) => {
    enemyModifiers.push(...getEnemyModifiersForChar(char));
    activeCharModifiers.push(...getActiveCharModifiersForChar(char));
  });

  const enemyModifiersSet = new Set(enemyModifiers);
  const activeCharModifiersSet = new Set(activeCharModifiers);

  const result: AplConditionBase[] = [
    buildAplCondEnemyHasModifier(engine, [...enemyModifiersSet.values()]),
    buildAplCondEnemyDoesntHaveModifier(engine, [
      ...enemyModifiersSet.values(),
    ]),
    buildAplCondActiveCharHasModifier(engine, [
      ...activeCharModifiersSet.values(),
    ]),
    buildAplCondActiveCharDoesntHaveModifier(engine, [
      ...activeCharModifiersSet.values(),
    ]),
  ];

  chars.forEach((char) => {
    getPossibleSkillsForChar(char).forEach((skillType) => {
      result.push(
        ...[buildAplCondSkillRemainingCooldown(engine, char, skillType)],
      );
    });
  });

  return result;
}
