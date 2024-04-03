import { EatchelBase } from "./EatchelBase";
import type { ShotType } from "../../engine/AttributeManager";
import { Formula } from "~/lib/engine/Formula";

export abstract class EatchelWithStandardSkillAndShot extends EatchelBase {
  private standardSkillCooldown = 5_000;

  private standardSkillDuration = 550;

  private skillShotDuration = 450;

  private gustOfPredation = {
    atkPercent: 120,
    flat: 26,
    hpRestoredAtkPercent: 20,
    hpRestoredFlat: 105,
  };

  private gustOfWandering = {
    shots: 2,
    healthPercent: 700,
    flat: 330,
    uEnergyRegen: 0.8,
  };

  private remainingStandardSkillShots = 0;

  private lastStandardSkillHeal = 0;

  protected override standardSkill() {
    const action = () => {
      this.engine.damageAndHealManager.dealDamage({
        targetOptions: {
          targetType: "enemy",
        },
        caster: this,
        damageType: "standardSkill",
        element: "kinetic",
        value: {
          type: "atkBased",
          percent: this.gustOfPredation.atkPercent,
          flat: this.gustOfPredation.flat,
        },
      });

      this.lastStandardSkillHeal = this.engine.damageAndHealManager.heal({
        targetOptions: {
          targetType: "creature",
          targetValue: this,
        },
        caster: this,
        value: {
          type: "atkBased",
          percent: this.gustOfPredation.hpRestoredAtkPercent,
          flat: this.gustOfPredation.hpRestoredFlat,
        },
      });

      this.remainingStandardSkillShots = this.gustOfWandering.shots;
      this.spentSEnergy(this.energyCost.standardSkill);
      this.startSkillCooldown("standardSkill", this.standardSkillCooldown);
    };

    this.engine.timeManager.doAction({
      action,
      duration: this.standardSkillDuration,
      isDurationConfirmed: false,
      description: "Eatchel standard skill",
      caster: this,
    });
  }

  protected override shot(type: ShotType) {
    if (this.remainingStandardSkillShots > 0) {
      return this.standardSkillShot();
    }

    return super.shot(type);
  }

  private standardSkillShot() {
    const action = () => {
      this.engine.damageAndHealManager.dealDamage({
        targetOptions: {
          targetType: "enemy",
        },
        caster: this,
        damageType: "standardSkill",
        element: "kinetic",
        getValue: () =>
          new Formula({
            action: "+",
            description: "gust of wandering damage",
            parts: [
              new Formula({
                action: "*",
                description: undefined,
                parts: [
                  {
                    value: this.gustOfWandering.healthPercent / 100,
                    visibleAsPercent: true,
                    description: "gust of wandering scale",
                  },
                  {
                    value: this.lastStandardSkillHeal,
                    description: "last stored standard skill heal",
                  },
                ],
              }),
              { value: this.gustOfWandering.flat, description: undefined },
            ],
          }),
      });

      this.remainingStandardSkillShots = Math.max(
        this.remainingStandardSkillShots - 1,
        0,
      );
      this.generateUEnergy(this.gustOfWandering.uEnergyRegen);
    };
    this.engine.timeManager.doAction({
      action,
      description: "Eatchel skill shot",
      duration: this.skillShotDuration,
      isDurationConfirmed: false,
      caster: this,
    });
  }
}
