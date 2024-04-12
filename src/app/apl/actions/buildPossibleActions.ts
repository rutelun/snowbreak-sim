import type { AplAction } from "~/app/apl/types";
import type { Engine } from "~/lib/engine/Engine";
import { getPossibleSkillsForChar } from "~/app/apl/getPossibleSkillsForChar";
import { getPossibleShotsForChar } from "~/app/apl/getPossibleShotsForChar";
import type { FullCharInfo } from "~/app/components/Pickers/types";

export function buildPossibleActions(charsInfo: FullCharInfo[]): AplAction[] {
  const result: AplAction[] = [];

  charsInfo.forEach((char) => {
    result.push(
      ...getPossibleSkillsForChar(char).map((skill) => ({
        id: `${char.char?.id}_${skill}`,
        description: `${char.char?.id}: ${skill}`,
        action: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).useSkill(skill),
        check: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).canUseSkill(skill),
      })),
    );

    const possibleShots = getPossibleShotsForChar(char);
    result.push(
      ...possibleShots.map((shot) => ({
        id: `${char.char?.id}_${shot}`,
        description: `${char.char?.id}: ${shot} shot`,
        action: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).useShot(shot),
        check: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).canShot(),
      })),
    );

    if (possibleShots.length > 0) {
      result.push({
        id: `${char.char?.id}_reload`,
        description: `${char.char?.id}: Reload weapon`,
        action: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).useReload(),
        check: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).canReload(),
      });
      result.push({
        id: `${char.char?.id}_partial_reload`,
        description: `${char.char?.id}: Reload one bullet at a time`,
        action: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).usePartialReload(),
        check: (engine: Engine) =>
          engine.teamManager.getCharById(char.char?.id).canReload(),
      });
    }
  });

  return result;
}
