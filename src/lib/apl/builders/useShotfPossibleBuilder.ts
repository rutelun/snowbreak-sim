import type { AplAction } from "~/lib/apl/types";
import type { Character } from "~/lib/engine/Character";
import type { ShotType } from "~/lib/engine/AttributeManager";

export function useSkillIfPossibleBuilder(
  char: Character,
  shotTypes: ShotType[],
): AplAction[] {
  return shotTypes.map((shotType) => ({
    name: `${char.name}: shot in ${shotType} mode`,
    disabled: false,
    canPerformAction: () => char.canShot(),
    action: () => char.useShot(shotType),
  }));
}
