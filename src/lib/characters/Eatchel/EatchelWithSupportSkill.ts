import { EatchelWithStandardSkillAndShot } from "./EatchelWithStandardSkillAndShot";
import type { ActionId } from "~/lib/engine/TimeManager";

export abstract class EatchelWithSupportSkill extends EatchelWithStandardSkillAndShot {
  private passiveHealing = {
    atkPercent: 5,
    flat: 37,
  };

  private supportSkillDuration = 1_050;

  private supportSkillCooldown = 12_000;

  private savagePounce = {
    healPercent: 60,
    healFlat: 446,
    healFinalMulti: 20,
    dmgPercent: 180,
    dmgFlat: 350,
  };

  private passiveHealingActionId: ActionId | undefined = undefined;

  public override onBattleStart() {
    super.onBattleStart();

    this.passiveHealingActionId = this.engine.timeManager.addPlannedAction({
      type: "interval",
      options: {
        tickInterval: 1_000,
      },
      description: "Eatchel passive healing",
      action: () => {
        if (!this.isSkillCooldownEnd("supportSkill")) {
          return;
        }

        this.engine.damageAndHealManager.heal({
          targetOptions: { targetType: "activeChar" },
          caster: this,
          value: {
            type: "atkBased",
            percent: this.passiveHealing.atkPercent,
            flat: this.passiveHealing.flat,
          },
        });
      },
    });
  }

  public override destroy() {
    if (this.passiveHealingActionId) {
      this.engine.timeManager.deletePlannedAction(this.passiveHealingActionId);
      this.passiveHealingActionId = undefined;
    }

    super.destroy();
  }

  protected override supportSkill() {
    const action = (): void => {
      this.engine.damageAndHealManager.dealDamage({
        targetOptions: { targetType: "enemy" },
        caster: this,
        element: "kinetic",
        damageType: "supportSkill",
        value: {
          type: "atkBased",
          percent: this.savagePounce.dmgPercent,
          flat: this.savagePounce.dmgFlat,
        },
      });
      this.engine.damageAndHealManager.heal({
        targetOptions: { targetType: "activeChar" },
        caster: this,
        value: {
          type: "atkBased",
          percent:
            this.savagePounce.healPercent *
            (1 + this.savagePounce.healFinalMulti / 100),
          flat:
            this.savagePounce.healFlat *
            (1 + this.savagePounce.healFinalMulti / 100),
        },
      });
      this.spentSEnergy(this.energyCost.supportSkill);
      this.startSkillCooldown("supportSkill", this.supportSkillCooldown);
    };

    this.engine.timeManager.doAction({
      action,
      description: "Eatchel support skill",
      duration: this.supportSkillDuration,
      isDurationConfirmed: false,
      caster: this,
    });
  }
}
