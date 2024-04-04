import { KaguyaBase } from "~/lib/characters/Kaguya/KaguyaBase";
import { getSkillValueByLevel } from "~/lib/utils/getSkillValueByLevel";
import type {
  InitializedModifier,
  Modifier,
} from "~/lib/engine/ModifierManager";
import type { ActionId } from "~/lib/engine/TimeManager";

export abstract class KaguyaWithSupportSkill extends KaguyaBase {
  private supportSkillCooldown = 20_000;
  private supportSkillDuration = 10_001;
  private supportSkillCastDuration = 1_000;

  private supportSkillDmgInterval = 1_250;
  private supportSkillAtk = 22;
  private supportSkillFlat = 33;
  private supportSkillRes = [14.4, 16.8, 19.2, 21.6, 24];
  private supportSkillAction: ActionId | undefined = undefined;

  public static supportSkillModifierName = "Kaguya elemental res decrease";

  private supportSkillModifier: Modifier = {
    name: KaguyaWithSupportSkill.supportSkillModifierName,
    unique: true,
    target: "enemy",
    durationType: "time",
    duration: this.supportSkillDuration,
    attr: "res%",
    getValue: () =>
      -getSkillValueByLevel(this.supportSkillRes, this.skillLevel.supportSkill),
    init: () => {
      this.supportSkillDamage();

      if (this.supportSkillAction) {
        this.engine.timeManager.deletePlannedAction(this.supportSkillAction);
        this.supportSkillAction = undefined;
      }

      this.supportSkillAction = this.engine.timeManager.addPlannedAction({
        type: "interval",
        options: {
          tickInterval: this.supportSkillDmgInterval,
        },
        description: "Kaguya support skill dmg",
        action: () => {
          this.supportSkillDamage();
        },
      });
    },
    destroy: () => {
      if (this.supportSkillAction) {
        this.engine.timeManager.deletePlannedAction(this.supportSkillAction);
        this.supportSkillAction = undefined;
      }
    },
  };

  private initializedSupportSkillModifier: InitializedModifier | undefined =
    undefined;

  public override onBattleStart() {
    super.onBattleStart();

    this.initializedSupportSkillModifier =
      this.engine.modifierManager.initializeModifier(
        this,
        this.supportSkillModifier,
      );
  }

  public override destroy() {
    if (this.initializedSupportSkillModifier) {
      this.engine.modifierManager.removeModifier(
        this.initializedSupportSkillModifier.id,
      );
      this.initializedSupportSkillModifier = undefined;
    }

    super.destroy();
  }

  private supportSkillDamage() {
    this.engine.damageAndHealManager.dealDamage({
      targetOptions: { targetType: "enemy" },
      element: this.element,
      caster: this,
      damageType: "supportSkill",
      value: {
        type: "atkBased",
        percent: getSkillValueByLevel(
          this.supportSkillAtk,
          this.skillLevel.supportSkill,
        ),
        flat: getSkillValueByLevel(
          this.supportSkillFlat,
          this.skillLevel.supportSkill,
        ),
      },
    });
  }

  protected supportSkill() {
    this.engine.timeManager.doAction({
      action: () => {
        if (!this.initializedSupportSkillModifier) {
          throw new Error("no initializedSupportSkillModifier");
        }

        this.engine.modifierManager.applyModifier(
          this.initializedSupportSkillModifier,
        );
        this.startSkillCooldown("supportSkill", this.supportSkillCooldown);
        this.spentSEnergy(this.energyCost.supportSkill);
      },
      caster: this,
      description: "Kaguya support skill",
      duration: this.supportSkillCastDuration,
      isDurationConfirmed: false,
    });
  }
}
