import type { Engine } from "./Engine";
import type { ShotType, SkillType } from "./AttributeManager";
import type { Creature } from "~/lib/engine/Creature";

export class AbilityManager {
  constructor(private engine: Engine) {}

  public useSkill(caster: Creature, skillType: SkillType, usage: () => void) {
    this.engine.subscriptionManager.trigger("onBeforeSkillUsed", {
      skillType,
      caster,
    });
    usage();
    this.engine.subscriptionManager.trigger("onSkillUsed", {
      skillType,
      caster,
    });
  }

  public useShot(caster: Creature, shotType: ShotType, usage: () => void) {
    usage();
  }

  public useReload(usage: () => void) {
    usage();
  }

  public usePartialReload(caster: Creature, usage: () => void) {
    usage();
    this.engine.subscriptionManager.trigger("onPartialReload", {
      caster,
    });
  }
}
