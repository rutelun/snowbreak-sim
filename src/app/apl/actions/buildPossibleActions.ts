import type { AplAction } from "~/app/apl/types";
import type { Engine } from "~/lib/engine/Engine";
import { getPossibleSkillsForChar } from "~/app/apl/getPossibleSkillsForChar";
import { getPossibleShotsForChar } from "~/app/apl/getPossibleShotsForChar";
import type { CharName } from "~/app/utils/pickers/constants";

export type CharInfo = {
  name: CharName;
};

export function buildPossibleActions(engine: Engine): AplAction[] {
  const result: AplAction[] = [];

  const chars = engine.teamManager.getTeam();
  chars.forEach((char) => {
    result.push(
      ...getPossibleSkillsForChar(char).map((skill) => ({
        id: `${char.name}_${skill}`,
        description: `${char.name}: ${skill}`,
        action: () => char.useSkill(skill),
        check: () => char.canUseSkill(skill),
      })),
    );

    const possibleShots = getPossibleShotsForChar(char);
    result.push(
      ...possibleShots.map((shot) => ({
        id: `${char.name}_${shot}`,
        description: `${char.name}: ${shot} shot`,
        action: () => char.useShot(shot),
        check: () => char.canShot(),
      })),
    );

    if (possibleShots.length > 0) {
      result.push({
        id: `${char.name}_reload`,
        description: `${char.name}: Reload weapon`,
        action: () => char.useReload(),
        check: () => char.canReload(),
      });
      result.push({
        id: `${char.name}_partial_reload`,
        description: `${char.name}: Reload one bullet at a time`,
        action: () => char.usePartialReload(),
        check: () => char.canReload(),
      });
    }
  });

  return result;
}
