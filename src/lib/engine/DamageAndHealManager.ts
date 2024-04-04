import type { Creature } from "./Creature";
import type { TargetOptions } from "./TargetManager";
import type { Engine } from "./Engine";
import type { Attribute, DamageType, ElementType } from "./AttributeManager";
import { SHOT_TYPES, SKILL_TYPES } from "./AttributeManager";
import { inArray } from "../utils/includes";
import { Formula } from "~/lib/engine/Formula";
import type { InitializedModifier } from "~/lib/engine/ModifierManager";

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
  | { getValue: () => Formula };

type HealOpts = {
  targetOptions: TargetOptions;
  caster: Creature;
  instanceOnlyModifiers?: InitializedModifier[];
} & HealOrDamageOpts;

type DealDamageOpts = {
  targetOptions: TargetOptions;
  caster: Creature;
  damageType: DamageType;
  element: ElementType;
  forceCanCrit?: boolean;
  instanceOnlyModifiers?: InitializedModifier[];
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
      opts.instanceOnlyModifiers?.map((mod) =>
        this.engine.modifierManager.applyModifier(mod),
      );
      const damageTakenMulti = this.getDamageTakenMulti(target, opts);
      const finalDmgMulti = this.getFinalDmgMulti(target, opts);
      const dmgMulti = this.getDmgMulti(target, opts);
      const defenseMulti = this.getDefenseMulti(target, opts);
      const critMulti = this.getCritMulti(target, opts);
      const resMulti = this.getResMulti(target, opts);
      const shieldMulti = this.getShieldMulti(target, opts);
      const initialDmg = this.getInitialValue(opts);

      const formula = new Formula({
        action: "*",
        parts: [
          initialDmg,
          critMulti.total,
          dmgMulti,
          finalDmgMulti,
          damageTakenMulti,
          defenseMulti,
          resMulti,
          shieldMulti,
        ],
        description: `${opts.caster.name} dealt damage`,
      });

      const dmg = formula.calc();

      this.engine.historyManager.add({
        type: "dealDamage",
        value: dmg,
        target,
        damageType: opts.damageType,
        element: opts.element,
        caster: opts.caster,
        formula,
      });

      opts.instanceOnlyModifiers?.map((mod) =>
        this.engine.modifierManager.removeModifier(mod.id),
      );

      this.engine.subscriptionManager.trigger("onDamageDealt", {
        value: dmg,
        target,
        damageType: opts.damageType,
        element: opts.element,
        caster: opts.caster,
        formula,
        critRateFormula: critMulti.critRate,
      });

      totalDmg += dmg;
    });

    return totalDmg;
  }

  public heal(opts: HealOpts) {
    const targets = this.engine.targetManager.getTargets(opts.targetOptions);
    let totalHeal = 0;
    targets.forEach((target) => {
      opts.instanceOnlyModifiers?.map((mod) =>
        this.engine.modifierManager.applyModifier(mod),
      );
      const initialHeal = this.getInitialValue(opts);
      const healEffectMulti = this.getHealEffectMulti(target, opts);

      const formula = new Formula({
        action: "*",
        parts: [initialHeal, healEffectMulti],
        description: "heal",
      });

      const targetHeal = formula.calc();

      this.engine.historyManager.add({
        type: "heal",
        value: targetHeal,
        target,
        caster: opts.caster,
      });

      opts.instanceOnlyModifiers?.map((mod) =>
        this.engine.modifierManager.removeModifier(mod.id),
      );

      this.engine.subscriptionManager.trigger("onHeal", {
        value: targetHeal,
        target,
      });

      totalHeal += targetHeal;
    });

    return totalHeal;
  }

  // todo: remove
  private getInitialValue(
    opts: HealOrDamageOpts & { caster: Creature },
  ): Formula {
    if ("getValue" in opts) {
      return opts.getValue();
    }

    const getAttributeByType = (type: DamageOrHealValue["type"]): Attribute => {
      switch (type) {
        case "atkBased":
          return "totalAtk";
        case "hpBased":
          return "totalHp";
      }
    };

    return new Formula({
      action: "+",
      parts: [
        new Formula({
          description: undefined,
          action: "*",
          parts: [
            {
              value: (opts.value.percent ?? 0) / 100,
              description: undefined,
              visibleAsPercent: true,
            },
            this.engine.attributeManager.getAttrFormula(
              opts.caster,
              getAttributeByType(opts.value.type),
            ),
          ],
        }),
        { value: opts.value.flat ?? 0, description: undefined },
      ],
      description: "damage",
    });
  }

  private getDmgMulti(target: Creature, opts: DealDamageOpts): Formula {
    const totalBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      "dmg%",
    );
    const elementBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      `${opts.element}Dmg%`,
    );
    const damageTypeBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      `${opts.damageType}Dmg%`,
    );
    let mainDmgTypeBuff = new Formula({
      baseResult: 0,
      parts: [],
      action: "*",
      description: undefined,
    });
    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttrFormula(
        opts.caster,
        "skillDmg%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttrFormula(
        opts.caster,
        "ballisticDmg%",
      );
    }

    return new Formula({
      description: "Damage multiplier",
      action: "+",
      parts: [
        { value: 1, description: undefined },
        totalBuff,
        elementBuff,
        damageTypeBuff,
        mainDmgTypeBuff,
      ],
    });
  }

  private getFinalDmgMulti(target: Creature, opts: DealDamageOpts): Formula {
    const totalBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      "finalDmg%",
    );
    const elementBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      `${opts.element}FinalDmg%`,
    );
    const damageTypeBuff = this.engine.attributeManager.getAttrFormula(
      opts.caster,
      `${opts.damageType}FinalDmg%`,
    );
    let mainDmgTypeBuff: Formula = new Formula({
      baseResult: 1,
      parts: [],
      action: "*",
      description: undefined,
    });

    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttrFormula(
        opts.caster,
        "skillFinalDmg%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgTypeBuff = this.engine.attributeManager.getAttrFormula(
        opts.caster,
        "ballisticFinalDmg%",
      );
    }

    return new Formula({
      action: "*",
      parts: [totalBuff, elementBuff, damageTypeBuff, mainDmgTypeBuff],
      description: "final damage multiplier",
    });
  }

  private getResMulti(target: Creature, opts: DealDamageOpts): Formula {
    const total = this.engine.attributeManager.getAttrFormula(target, "res%");
    const element = this.engine.attributeManager.getAttrFormula(
      target,
      `${opts.element}Res%`,
    );
    const damageType = this.engine.attributeManager.getAttrFormula(
      target,
      `${opts.damageType}Res%`,
    );
    let mainDmgType: Formula;
    if (inArray(SKILL_TYPES, opts.damageType)) {
      mainDmgType = this.engine.attributeManager.getAttrFormula(
        target,
        "skillRes%",
      );
    } else if (inArray(SHOT_TYPES, opts.damageType)) {
      mainDmgType = this.engine.attributeManager.getAttrFormula(
        target,
        "ballisticRes%",
      );
    } else {
      mainDmgType = new Formula({
        baseResult: 0,
        parts: [],
        action: "+",
        description: undefined,
      });
    }

    const totalResFormula = new Formula({
      description: undefined,
      action: "+",
      parts: [total, element, damageType, mainDmgType],
    });

    return new Formula({
      description: "resistance multiplier",
      action: "-",
      parts: [
        new Formula({
          action: "-",
          description: undefined,
          parts: [{ value: 1, description: undefined }],
        }),
        totalResFormula,
      ],
    });
  }

  private getCritMulti(
    target: Creature,
    opts: DealDamageOpts,
  ): { total: Formula; critRate: Formula } {
    let critRate: Formula;
    if (opts.forceCanCrit === false || inArray(SKILL_TYPES, opts.damageType)) {
      critRate = new Formula({
        action: "*",
        parts: [],
        baseResult: 0,
        visibleAsPercent: true,
        description: "critRate",
      });
    } else if (this.opts.alwaysHitWeakPoint) {
      critRate = new Formula({
        action: "*",
        parts: [],
        baseResult: 1,
        visibleAsPercent: true,
        description: "critRate",
      });
    } else {
      critRate = this.engine.attributeManager.getAttrFormula(
        opts.caster,
        "critRate",
      );
    }

    const total = new Formula({
      action: "+",
      description: "crit multiplier",
      parts: [
        { value: 1, description: undefined },
        new Formula({
          action: "*",
          description: undefined,
          parts: [
            critRate,
            this.engine.attributeManager.getAttrFormula(
              opts.caster,
              "critDmg%",
            ),
          ],
        }),
      ],
    });

    return { total, critRate };
  }

  private getShieldMulti(target: Creature, opts: DealDamageOpts): Formula {
    let shieldMulti: number;
    if (target.hasShield() && inArray(SHOT_TYPES, opts.damageType)) {
      shieldMulti = 2;
    } else {
      shieldMulti = 1;
    }

    return new Formula({
      action: "*",
      parts: [{ value: shieldMulti, description: undefined }],
      baseResult: 1,
      baseResultVisible: true,
      description: "shield multiplier",
    });
  }

  private getDamageTakenMulti(
    target: Creature,
    _opts: DealDamageOpts,
  ): Formula {
    return this.engine.attributeManager.getAttrFormula(target, "damageTaken%");
  }

  private getHealEffectMulti(target: Creature, _opts: HealOpts): Formula {
    return new Formula({
      action: "+",
      parts: [
        { value: 1, description: undefined },
        this.engine.attributeManager.getAttrFormula(target, "healBonus%"),
      ],
      description: "heal effect multiplier",
      baseResult: 1,
      baseResultVisible: true,
    });
  }

  private getDefenseMulti(_target: Creature, _opts: DealDamageOpts) {
    return new Formula({
      action: "*",
      parts: [],
      baseResult: 0.5,
      baseResultVisible: true,
      description: "defense multiplier",
    });
  }
}
