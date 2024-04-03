import type { DamageOrHealValue } from "~/lib/engine/DamageAndHealManager";
import type { SkillLvl } from "~/lib/utils/getSkillValueByLevel";
import { getSkillValueByLevel } from "~/lib/utils/getSkillValueByLevel";

type Options = {
  type: DamageOrHealValue["type"];
  percent?: number | number[];
  flat?: number | number[];
};
export function getDamageOrHealBySkillLevel(
  opts: Options,
  lvl: SkillLvl,
): DamageOrHealValue {
  return {
    type: opts.type,
    percent: getSkillValueByLevel(opts.percent ?? 0, lvl),
    flat: getSkillValueByLevel(opts.flat ?? 0, lvl),
  };
}
