import { getSkillValueByLevel } from "~/lib/utils/getSkillValueByLevel";
import type { ActionId } from "~/lib/engine/TimeManager";
import { LittleSunshineBase } from "~/lib/characters/LittleSunshine/LittleSunshineBase";
import { inArray } from "~/lib/utils/includes";
import { SHOT_TYPES } from "~/lib/engine/AttributeManager";

export abstract class LittleSunshineWithSupportSkill extends LittleSunshineBase {
  private supportSkillCooldown = 25_000;
  private supportSkillCooldownM1 = 15_000;
  private supportSkillDuration = 10_000;

  private supportSkillPercent = [6, 7, 8, 9, 10, 11];
  private supportSkillFlat = [7, 9, 12, 16, 21, 27];

  private m5AtkMulti = 1.25;

  private supportSkillCastDuration = 700;

  private pyrophosFinalDmgFromBurning = 20;

  private burningDmgPercent = 10;
  private burningDmgInterval = 500;
  private burningDmgDuration = 5_000;

  private knockUpAtk = 100;

  private burningDmgAction: ActionId | undefined = undefined;

  public override onBattleStart() {
    super.onBattleStart();
  }

  private burningSupportSkillDamage() {
    this.engine.damageAndHealManager.dealDamage({
      targetOptions: { targetType: "enemy" },
      element: this.element,
      caster: this,
      damageType: "supportSkill",
      value: {
        type: "atkBased",
        percent: this.burningDmgPercent,
      },
    });
  }
  private supportSkillKnockUpDamage() {
    this.engine.damageAndHealManager.dealDamage({
      targetOptions: { targetType: "enemy" },
      element: this.element,
      caster: this,
      damageType: "supportSkill",
      value: {
        type: "atkBased",
        percent: this.knockUpAtk,
      },
    });
  }

  private supportSkillDamage() {
    this.engine.damageAndHealManager.dealDamage({
      targetOptions: { targetType: "enemy" },
      element: this.element,
      caster: this,
      damageType: "supportSkill",
      instanceOnlyModifiers: [
        this.engine.modifierManager.initializeModifier(this, {
          name: "Pyrphoros Final Dmg",
          durationType: "permanent",
          target: "creator",
          unique: true,
          attr: "finalDmg%",
          getValue: () => {
            const enemy = this.engine.getEnemy();
            return this.engine.effectManager.hasEffect(enemy, "burning")
              ? this.pyrophosFinalDmgFromBurning
              : 0;
          },
        }),
      ],
      value: {
        type: "atkBased",
        percent:
          getSkillValueByLevel(
            this.supportSkillPercent,
            this.skillLevel.supportSkill + (this.manifestation >= 4 ? 1 : 0),
          ) * (this.manifestation >= 5 ? this.m5AtkMulti : 1),
        flat: getSkillValueByLevel(
          this.supportSkillFlat,
          this.skillLevel.supportSkill + (this.manifestation >= 4 ? 1 : 0),
        ),
      },
    });

    this.engine.effectManager.applyEffect(this.engine.getEnemy(), {
      effect: "burning",
      duration: this.burningDmgDuration,
    });
  }

  protected supportSkill() {
    this.engine.timeManager.doAction({
      action: () => {
        this.supportSkillKnockUpDamage();
        if (
          this.burningDmgAction &&
          this.engine.timeManager.hasActionInQueue(this.burningDmgAction)
        ) {
          this.engine.timeManager.changeRemainingDuration(
            this.burningDmgAction,
            this.burningDmgDuration,
          );
        } else {
          this.burningDmgAction = this.engine.timeManager.addPlannedAction({
            type: "interval",
            options: {
              tickInterval: this.burningDmgInterval,
              duration: this.burningDmgDuration,
            },
            description: "Little Sunshine burning",
            action: () => this.burningSupportSkillDamage(),
          });
        }
        const dealDamageSubscription =
          this.engine.subscriptionManager.temporarySubscribe({
            type: "onDamageDealt",
            description: "Expire Little Sunshine support skill",
            duration: this.supportSkillDuration,
            subscriber: ({ damageType }) => {
              if (inArray(SHOT_TYPES, damageType)) {
                this.supportSkillDamage();
              }
            },
          });
        if (this.manifestation >= 3) {
          const reloadSubscription = this.engine.subscriptionManager.subscribe(
            "onPartialReload",
            () => {
              this.engine.subscriptionManager.updateTemporarySubscribeDuration(
                dealDamageSubscription,
                this.supportSkillDuration,
              );
              this.engine.subscriptionManager.unsubscribe(reloadSubscription);
            },
          );
        }

        this.spentSEnergy(this.energyCost.supportSkill);
        this.startSkillCooldown(
          "supportSkill",
          this.manifestation >= 1
            ? this.supportSkillCooldownM1
            : this.supportSkillCooldown,
        );
      },
      caster: this,
      description: "Little sunshine support skill",
      duration: this.supportSkillCastDuration,
      isDurationConfirmed: false,
    });
  }
}
