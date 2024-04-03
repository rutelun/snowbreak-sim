import type { Creature } from "./Creature";
import type { TargetOptions } from "./TargetManager";
import type { Engine } from "./Engine";
import type { DamageType, ElementType } from "./AttributeManager";
import { SHOT_TYPES, SKILL_TYPES } from "./AttributeManager";
import { inArray } from "../utils/includes";

type HealOrDamageValueFromAtk = {
  type: "atkBased";
  percent?: number;
  flat?: number;
};

type HealOrDamageValueFromHp = {
  type: "hpBased";
  percent?: number;
  flat?: number;
};

export type DamageOrHealValue =
  | HealOrDamageValueFromAtk
  | HealOrDamageValueFromHp;
type HealOrDamageOpts =
  | { value: DamageOrHealValue }
  | { getValue: () => number };

type HealOpts = {
  targetOptions: TargetOptions;
  caster: Creature;
} & HealOrDamageOpts;

type DealDamageOpts = {
  targetOptions: TargetOptions;
  caster: Creature;
  damageType: DamageType;
  element: ElementType;
  forceCanCrit?: boolean;
} & HealOrDamageOpts;

export type DamageAndHealManagerOpts = {
  alwaysHitWeakPoint?: boolean;
};

export class DamageAndHealManager {
  public constructor(
    private engine: Engine,
    private opts: DamageAndHealManagerOpts,
  ) {}

  public dealDamage(opts: DealDamageOpts) {
    const targets = this.engine.targetManager.getTargets(opts.targetOptions);
    let totalDmg = 0;
    targets.forEach((target) => {
      const damageTakenMulti = this.getDamageTakenMulti(target, opts);
      const finalDmgMulti = this.getFinalDmgMulti(target, opts);
      const dmgMulti = this.getDmgMulti(target, opts);
      const defenseMulti = this.getDefenseMulti(target, opts);
      const critMulti = this.getCritMulti(target, opts);
      const resMulti = this.getResMulti(target, opts);
      const shieldMulti = this.getShieldMulti(target, opts);
      const initialDmg = this.getInitialValue(opts);

      const targetDmg =
        initialDmg *
        critMulti *
        dmgMulti *
        finalDmgMulti *
        damageTakenMulti *
        defenseMulti *
        resMulti *
        shieldMulti;
      this.engine.historyManager.add({
        type: "dealDamage",
        value: targetDmg,
        target,
        damageType: opts.damageType,
        element: opts.element,
        caster: opts.caster,
      });

      totalDmg += targetDmg;
    });

    return totalDmg;
  }

  public heal(opts: HealOpts) {
    const targets = this.engine.targetManager.getTargets(opts.targetOptions);
    let totalHeal = 0;
    targets.forEach((target) => {
      const initialHeal = this.getInitialValue(opts);
      const healEffectMulti = this.getHealEffectMulti(target, opts);

      const targetHeal = initialHeal * healEffectMulti;

      this.engine.subscriptionManager.trigger("onHeal", {
        value: targetHeal,
        target,
      });

      this.engine.historyManager.add({
        type: "heal",
        value: targetHeal,
        target,
        caster: opts.caster,
      });

      totalHeal += targetHeal;
    });

    return totalHeal;
  }

  private getInitialValue(
    opts: HealOrDamageOpts & { caster: Creature },
  ): number {
    if ("getValue" in opts) {
      return opts.getValue();
    }

    switch (opts.value.type) {
      case "atkBased":
        return (
          (this.engine.attributeManager.getAttr(opts.caster, "totalAtk") *
            (opts.value.percent ?? 0)) /
            100 +
          (opts.value.flat ?? 0)
        );
      case "hpBased":
        return (
          (this.engine.attributeManager.getAttr(opts.caster, "totalHp") *
            (opts.value.percent ?? 0)) /
            100 +
          (opts.value.flat ?? 0)
        );
      default:
        throw new Error("unsupported type of dmg calc");
    }
  }

  private getDmgMulti(target: Creature, opts: DealDamageOpts) {
    const totalBuff = this.engine.attributeManager.getAttr(opts.caster, "dmg%");
    const elementBuff = this.engine.attributeManager.getAttr(
      opts.caster,
      `${opts.element}Dmg%`,
    );
    const damageTypeBuff = this.engine.attributeManager.getAttr(
      opts.caster,
      `${opts.damageType}Dmg%`,
    );
    let mainDmgTypeBuff = 0;
    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        opts.caster,
        "skillDmg%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        opts.caster,
        "ballisticDmg%",
      );
    }

    return 1 + totalBuff + elementBuff + damageTypeBuff + mainDmgTypeBuff;
  }

  private getFinalDmgMulti(target: Creature, opts: DealDamageOpts) {
    const totalBuff = this.engine.attributeManager.getAttr(
      opts.caster,
      "finalDmg%",
    );
    const elementBuff = this.engine.attributeManager.getAttr(
      opts.caster,
      `${opts.element}FinalDmg%`,
    );
    const damageTypeBuff = this.engine.attributeManager.getAttr(
      opts.caster,
      `${opts.damageType}FinalDmg%`,
    );
    let mainDmgTypeBuff = 1;
    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        opts.caster,
        "skillFinalDmg%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        opts.caster,
        "ballisticFinalDmg%",
      );
    }

    return totalBuff * elementBuff * damageTypeBuff * mainDmgTypeBuff;
  }

  private getResMulti(target: Creature, opts: DealDamageOpts) {
    const totalBuff = this.engine.attributeManager.getAttr(target, "res%");
    const elementBuff = this.engine.attributeManager.getAttr(
      target,
      `${opts.element}Res%`,
    );
    const damageTypeBuff = this.engine.attributeManager.getAttr(
      target,
      `${opts.damageType}Res%`,
    );
    let mainDmgTypeBuff = 1;
    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        target,
        "skillRes%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttr(
        target,
        "ballisticRes%",
      );
    }

    return Math.max(
      1 - totalBuff * elementBuff * damageTypeBuff * mainDmgTypeBuff,
      0.1,
    );
  }

  private getCritMulti(target: Creature, opts: DealDamageOpts) {
    if (opts.forceCanCrit === false || inArray(SKILL_TYPES, opts.damageType)) {
      return 1;
    }

    const critRate = this.opts.alwaysHitWeakPoint
      ? 100
      : this.engine.attributeManager.getAttr(opts.caster, "critRate");

    return (
      1 +
      critRate * this.engine.attributeManager.getAttr(opts.caster, "critDmg%")
    );
  }

  private getShieldMulti(target: Creature, opts: DealDamageOpts) {
    if (target.hasShield() && inArray(SHOT_TYPES, opts.damageType)) {
      return 2;
    }

    return 1;
  }

  private getDamageTakenMulti(target: Creature, _opts: DealDamageOpts) {
    return this.engine.attributeManager.getAttr(target, "damageTaken%");
  }

  private getHealEffectMulti(target: Creature, _opts: HealOpts) {
    return 1 + this.engine.attributeManager.getAttr(target, "healBonus%");
  }

  private getDefenseMulti(_target: Creature, _opts: DealDamageOpts) {
    // TODO:
    return 0.5;
  }
}
