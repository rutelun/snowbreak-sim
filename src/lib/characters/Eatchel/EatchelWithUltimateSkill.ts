import { EatchelWithSupportSkill } from "./EatchelWithSupportSkill";
import type { DamageOrHealValue } from "~/lib/engine/DamageAndHealManager";
import { scaleDamageOrHeal } from "~/lib/utils/scaleDamageOrHeal";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";
import type { ActionId } from "~/lib/engine/TimeManager";
import { getDamageOrHealBySkillLevel } from "~/lib/utils/getDamageOrHealBySkillLevel";

export abstract class EatchelWithUltimateSkill extends EatchelWithSupportSkill {
  private ultimateSkillCooldown = 60_000;
  private energyForUltimateMaxEffect = 100;

  private maxClawCount = 5;
  private maxClawDuration = 20_000;
  private clawChargeFromDamagePercent = 40;
  private clawCapacityToAtkPercent = 5;
  private clawMaxCapacityBonusFromHealingEffectPercent = 50;
  private clawMaxCapacity = {
    percent: 50,
    flat: 240,
  };

  private swiftAttackCount = 13;
  private swiftAttackSettings: DamageOrHealValue = {
    type: "atkBased",
    percent: 72,
    flat: 380,
  };

  private unyieldingRise: DamageOrHealValue = {
    type: "hpBased",
    percent: 12,
    flat: 2000,
  };

  private ultimateModifier: InitializedModifier | undefined = undefined;
  private clawClearHeal = {};

  public static ultimateModifierName = "Eatchel Claws";

  private clearClaws() {
    if (this.ultimateModifier) {
      this.engine.modifierManager.removeModifier(this.ultimateModifier.id);
      this.ultimateModifier = undefined;
    }
  }

  protected override ultimateSkill() {
    this.engine.timeManager.doAction({
      action: () => this.ultimateAction(),
      caster: this,
      description: "Eatchel ultimate",
      isDurationConfirmed: false,
      duration: 500,
    });
  }

  private getClawMaxCapacity(loadout: boolean = false) {
    const getAttr = loadout
      ? this.engine.attributeManager.getLoadoutAttr.bind(
          this.engine.attributeManager,
        )
      : this.engine.attributeManager.getAttr.bind(this.engine.attributeManager);

    const atkForClawCapacity = getAttr(this, "totalAtk");

    const clawMaxCapacityWithoutHealEffect =
      (this.clawMaxCapacity.percent / 100) * atkForClawCapacity +
      this.clawMaxCapacity.flat;

    return (
      clawMaxCapacityWithoutHealEffect *
      (1 +
        (getAttr(this, "healBonus%") *
          this.clawMaxCapacityBonusFromHealingEffectPercent) /
          100)
    );
  }

  private applyUltModifier(
    scale: number,
    clawCount: number,
    clawMaxCapacity: number,
  ) {
    let actionId: ActionId | undefined = undefined;
    this.ultimateModifier = this.engine.modifierManager.initializeModifier(
      this,
      {
        durationType: "permanent",
        name: EatchelWithUltimateSkill.ultimateModifierName,
        unique: false,
        target: "team",
        attr: "atkFlat",
        init: () => {
          actionId = this.engine.timeManager.addPlannedAction({
            description: "Eatchel claw loss",
            type: "interval",
            options: {
              tickInterval: this.maxClawDuration * scale,
            },
            action: () => {
              clawCount = Math.max(clawCount, this.manifestation >= 1 ? 2 : 0);
              if (clawCount === 0 && actionId) {
                this.engine.timeManager.deletePlannedAction(actionId);
              }
            },
          });
        },
        destroy: () => {
          if (actionId) {
            this.engine.timeManager.deletePlannedAction(actionId);
          }
        },
        getValue: () => {
          return (
            (clawCount * clawMaxCapacity * this.clawCapacityToAtkPercent) / 100
          );
        },
      },
    );

    this.engine.modifierManager.applyModifier(this.ultimateModifier);
  }

  public override onBattleStart() {
    super.onBattleStart();

    if (this.manifestation >= 1) {
      this.applyUltModifier(1, 2, this.getClawMaxCapacity(true));
    }
  }

  private ultimateAction() {
    this.clearClaws();

    const clawMaxCapacity = this.getClawMaxCapacity();

    const currentEnergy = this.engine.uEnergyManager.getCurrent();
    const scale = Math.max(currentEnergy / this.energyForUltimateMaxEffect, 1);

    let accumulatedDmg = 0;

    for (let i = 0; i < this.swiftAttackCount; i += 1) {
      accumulatedDmg += this.engine.damageAndHealManager.dealDamage({
        targetOptions: { targetType: "enemy" },
        damageType: "ultimateSkill",
        element: "kinetic",
        caster: this,
        value: getDamageOrHealBySkillLevel(
          this.swiftAttackSettings,
          this.skillLevel.supportSkill,
        ),
      });

      let clawCount = Math.min(
        (accumulatedDmg * this.clawChargeFromDamagePercent) /
          100 /
          clawMaxCapacity,
        this.maxClawCount,
      );

      this.applyUltModifier(scale, clawCount, clawMaxCapacity);
    }

    this.engine.damageAndHealManager.heal({
      targetOptions: { targetType: "team" },
      caster: this,
      value: scaleDamageOrHeal(
        getDamageOrHealBySkillLevel(
          getDamageOrHealBySkillLevel(
            this.unyieldingRise,
            this.skillLevel.supportSkill,
          ),
          this.skillLevel.supportSkill,
        ),
        scale,
      ),
    });

    this.engine.uEnergyManager.spent(currentEnergy);
    this.startSkillCooldown("ultimateSkill", this.ultimateSkillCooldown);
  }
}
