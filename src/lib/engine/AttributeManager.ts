import type { Engine } from "./Engine";
import type { Creature } from "./Creature";
import { Character } from "./Character";
import { inArray } from "../utils/includes";

export type AttributeAggregator = {
  aggregator: (result: number, newValue: number) => number;
  baseValue: number;
};

export class AttributeManager {
  public constructor(private engine: Engine) {}

  public getAggregatorForAttr(attr: Attribute): AttributeAggregator {
    if (inArray(FINAL_DAMAGE_ATTRIBUTES, attr)) {
      return {
        aggregator: (res, val) => res * (1 + val / 100),
        baseValue: 1,
      };
    }
    if (inArray(OTHER_ATTRIBUTES, attr)) {
      return {
        aggregator: (res, val) => res + val,
        baseValue: 0,
      };
    }
    if (
      inArray(DAMAGE_ATTRIBUTES, attr) ||
      inArray(PERCENT_ATTRIBUTE, attr) ||
      inArray(RESISTANCE_ATTRIBUTES, attr)
    ) {
      return {
        aggregator: (res, val) => res + val / 100,
        baseValue: 0,
      };
    }
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      throw new Error(`cant use aggregator for total attr ${attr}`);
    }

    throw new Error(`unknown attr ${attr}`);
  }

  private calculateTotalAttr(
    attr: (typeof TOTAL_ATTRIBUTES)[number],
    getter: (attr: Attribute) => number,
  ): number {
    switch (attr) {
      case "totalAtk":
        return getter("atkBase") * (1 + getter("atk%")) + getter("atkFlat");
      case "totalHp":
        return getter("hpBase") * (1 + getter("hp%")) + getter("hpFlat");
      case "totalDef":
        return getter("defBase") * (1 + getter("def%")) + getter("defFlat");
      default:
        throw new Error(`unknown total attr ${attr}`);
    }
  }

  public getAttr(creature: Creature, attr: Attribute): number {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      return this.calculateTotalAttr(attr, (locAttr) =>
        this.getAttr(creature, locAttr),
      );
    }

    const aggregator = this.getAggregatorForAttr(attr);

    const loadoutAttr = this.getLoadoutAttr(creature, attr);
    return this.engine.modifierManager.calcAttr(creature, attr, {
      aggregator: aggregator.aggregator,
      baseValue: loadoutAttr,
    });
  }

  public getLoadoutAttr(creature: Creature, attr: Attribute): number {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      return this.calculateTotalAttr(attr, (locAttr) =>
        this.getLoadoutAttr(creature, locAttr),
      );
    }

    const aggregator = this.getAggregatorForAttr(attr);

    let result = aggregator.baseValue;
    result = aggregator.aggregator(result, creature.getOwnAttr(attr));
    if (creature instanceof Character) {
      result = aggregator.aggregator(result, creature.weapon.getOwnAttr(attr));
      result = aggregator.aggregator(
        result,
        creature.logistics?.getOwnAttr(attr) ?? 0,
      );
    }

    return result;
  }
}
export const ELEMENTS_TYPES = [
  "kinetic",
  "thermal",
  "frost",
  "electrical",
  "chaos",
] as const;
export const ELEMENTS_TYPES_WITH_GENERIC = [
  ...ELEMENTS_TYPES,
  "elemental",
] as const;

export const SKILL_TYPES = [
  "standardSkill",
  "supportSkill",
  "ultimateSkill",
] as const;

export const SKILL_TYPES_WITH_GENERIC = [...SKILL_TYPES, "skill"] as const;

export const SHOT_TYPES = ["ads", "hip-fire"] as const;
export const SHOT_TYPES_WITH_GENERIC = [...SHOT_TYPES, "ballistic"] as const;

function createAttributesForType<T extends string>(items: readonly T[]) {
  return {
    dmg: items.map((item) => `${item}Dmg%` as const),
    finalDmg: items.map((item) => `${item}FinalDmg%` as const),
    resistance: items.map((item) => `${item}Res%` as const),
  };
}

export const {
  dmg: ATTRIBUTES_ELEMENTAL_DMG,
  finalDmg: ATTRIBUTES_ELEMENTAL_FINAL_DMG,
  resistance: ATTRIBUTES_ELEMENTAL_RESISTANCE,
} = createAttributesForType(ELEMENTS_TYPES_WITH_GENERIC);

export const {
  dmg: ATTRIBUTES_SKILL_DMG,
  finalDmg: ATTRIBUTES_SKILL_FINAL_DMG,
  resistance: ATTRIBUTES_SKILL_RESISTANCE,
} = createAttributesForType(SKILL_TYPES_WITH_GENERIC);

export const {
  dmg: ATTRIBUTES_SHOT_DMG,
  finalDmg: ATTRIBUTES_SHOT_FINAL_DMG,
  resistance: ATTRIBUTES_SHOT_RESISTANCE,
} = createAttributesForType(SHOT_TYPES_WITH_GENERIC);

export const FINAL_DAMAGE_ATTRIBUTES = [
  ...ATTRIBUTES_ELEMENTAL_FINAL_DMG,
  ...ATTRIBUTES_SKILL_FINAL_DMG,
  ...ATTRIBUTES_SHOT_FINAL_DMG,
  "finalDmg%",
  "damageTaken%",
] as const;
export const DAMAGE_ATTRIBUTES = [
  ...ATTRIBUTES_ELEMENTAL_DMG,
  ...ATTRIBUTES_SKILL_DMG,
  ...ATTRIBUTES_SHOT_DMG,
  "dmg%",
] as const;
export const RESISTANCE_ATTRIBUTES = [
  ...ATTRIBUTES_ELEMENTAL_RESISTANCE,
  ...ATTRIBUTES_SKILL_RESISTANCE,
  ...ATTRIBUTES_SHOT_RESISTANCE,
  "res%",
] as const;

export const TOTAL_ATTRIBUTES = ["totalAtk", "totalHp", "totalDef"] as const;

export const PERCENT_ATTRIBUTE = [
  "hp%",
  "atk%",
  "def%",
  "critDmg%",
  "sEnergyRecovery%",
  "uEnergyRecovery%",
  "healBonus%",
  "auxiliary%",
  "critRate",
  "skillHaste",
  "shield%",
] as const;

export const OTHER_ATTRIBUTES = [
  "aligmentIndex",
  "hpFlat",
  "atkFlat",
  "defFlat",
  "atkBase",
  "hpBase",
  "defBase",
] as const;

export const ATTRIBUTES = [
  ...FINAL_DAMAGE_ATTRIBUTES,
  ...DAMAGE_ATTRIBUTES,
  ...RESISTANCE_ATTRIBUTES,
  ...TOTAL_ATTRIBUTES,
  ...PERCENT_ATTRIBUTE,
  ...OTHER_ATTRIBUTES,
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];
export type ElementType = (typeof ELEMENTS_TYPES)[number];
export type ShotType = (typeof SHOT_TYPES)[number];
export type SkillType = (typeof SKILL_TYPES)[number];
export type DamageType = ShotType | SkillType;
export type AttributesObj = {
  [stat in Attribute]?: number;
};
