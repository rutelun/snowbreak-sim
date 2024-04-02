import type { Engine } from "./Engine";
import type { ShotType, SkillType } from "./AttributeManager";

export class AbilityManager {
  constructor(private engine: Engine) {}

  public useSkill(skillType: SkillType, usage: () => void) {
    usage();
  }

  public useShot(shotType: ShotType, usage: () => void) {
    usage();
  }

  public useReload(usage: () => void) {
    usage();
  }

  public usePartialReload(usage: () => void) {
    usage();
  }
}
