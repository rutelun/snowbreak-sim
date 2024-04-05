import type { Engine } from "./Engine";
import type { Creature } from "./Creature";
import { Character } from "./Character";
import { inArray } from "../utils/includes";
import type { FormulaPart, SimpleFormulaPart } from "~/lib/engine/Formula";
import { Formula } from "~/lib/engine/Formula";

export type AttributeAggregator = {
  aggregator: (result: number, newValue: number) => number;
  baseValue: number;
};

export type FormulaAggregator = {
  formula: Formula;
  getNewPart: (simplePart: SimpleFormulaPart) => FormulaPart;
};

export type AttributeDistribution = {
  value: number;
  description: string;
};

export type AttributeWithDistribution = {
  attr: Exclude<Attribute, TotalAttribute>;
  value: number;
  valueDistribution: Array<AttributeDistribution>;
};

export type TotalAttributeWithDistribution = {
  attr: TotalAttribute;
  value: number;
  innerAttrs: AttributeWithDistribution[];
};

export class AttributeManager {
  public constructor(private engine: Engine) {}

  public getAggregatorFormula(attr: Attribute): FormulaAggregator {
    if (inArray(FINAL_DAMAGE_ATTRIBUTES, attr)) {
      return {
        formula: new Formula({
          action: "*",
          parts: [],
          description: attr,
          baseResult: 1,
          visibleAsPercent: true,
        }),
        getNewPart: (part: SimpleFormulaPart) =>
          new Formula({
            action: "+",
            parts: [
              { value: 1, description: undefined, visibleAsPercent: true },
              {
                description: part.description,
                value: part.value / 100,
                visibleAsPercent: true,
              },
            ],
            description: undefined,
          }),
      };
    }
    if (inArray(OTHER_ATTRIBUTES, attr)) {
      return {
        formula: new Formula({
          action: "+",
          parts: [],
          description: attr,
          baseResult: 0,
          visibleAsPercent: false,
        }),
        getNewPart: (part) => part,
      };
    }
    if (inArray(ALL_PERCENT_ATTRIBUTES, attr)) {
      return {
        formula: new Formula({
          action: "+",
          parts: [],
          description: attr,
          baseResult: 0,
          visibleAsPercent: true,
        }),
        getNewPart: (part) => ({
          description: part.description,
          value: part.value / 100,
          visibleAsPercent: true,
        }),
      };
    }

    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      throw new Error(`cant use aggregator for total attr ${attr}`);
    }

    throw new Error(`unknown attr ${attr}`);
  }

  private getTotalAttrFormula(
    attr: TotalAttribute,
    getter: (attr: Exclude<Attribute, TotalAttribute>) => Formula,
  ): Formula {
    const totalToParts = {
      totalAtk: { base: "atkBase", percent: "atk%", flat: "atkFlat" },
      totalHp: { base: "hpBase", percent: "hp%", flat: "hpFlat" },
      totalDef: { base: "defBase", percent: "def%", flat: "defFlat" },
    } as const;

    return new Formula({
      action: "+",
      parts: [
        new Formula({
          action: "*",
          parts: [
            getter(totalToParts[attr].base),
            new Formula({
              action: "+",
              parts: [
                { value: 1, description: undefined, visibleAsPercent: true },
                getter(totalToParts[attr].percent),
              ],
              baseResult: 1,
              description: undefined,
              visibleAsPercent: true,
            }),
          ],
          description: undefined,
        }),
        getter(totalToParts[attr].flat),
      ],
      description: attr,
    });
  }

  public getAttrFormula(creature: Creature, attr: Attribute): Formula {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      return this.getTotalAttrFormula(attr, (locAttr) =>
        this.getAttrFormula(creature, locAttr),
      );
    }

    const formulaWithAdd = this.getAggregatorFormula(attr);

    formulaWithAdd.formula.parts.push(
      ...this.getLoadoutAttrFormula(creature, attr).parts,
    );

    const parts = this.engine.modifierManager.getAttrFormulaParts(
      creature,
      attr,
    );

    formulaWithAdd.formula.parts.push(
      ...parts.map((part) => formulaWithAdd.getNewPart(part)),
    );

    return formulaWithAdd.formula;
  }

  public getLoadoutAttrFormula(creature: Creature, attr: Attribute): Formula {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      return this.getTotalAttrFormula(attr, (locAttr) =>
        this.getLoadoutAttrFormula(creature, locAttr),
      );
    }

    const parts: SimpleFormulaPart[] = [];
    const ownAttribute = creature.getOwnAttr(attr);
    if (ownAttribute !== 0) {
      parts.push({
        value: ownAttribute,
        description: `${creature.name} own attribute`,
      });
    }
    if (creature instanceof Character) {
      const weaponAttributeValue = creature.weapon.getOwnAttr(attr);
      if (weaponAttributeValue !== 0) {
        parts.push({
          value: weaponAttributeValue,
          description: `${creature.name} weapon attribute`,
        });
      }
      const logisticsAttributeValue = creature.logistics?.getOwnAttr(attr) ?? 0;
      if (logisticsAttributeValue !== 0) {
        parts.push({
          value: logisticsAttributeValue,
          description: `${creature.name} logistics attribute`,
        });
      }
    }

    const formulaWithAdd = this.getAggregatorFormula(attr);

    formulaWithAdd.formula.parts.push(
      ...parts.map((part) => formulaWithAdd.getNewPart(part)),
    );

    return formulaWithAdd.formula;
  }

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
    if (inArray(ALL_PERCENT_ATTRIBUTES, attr)) {
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
    getter: (attr: Exclude<Attribute, TotalAttribute>) => number,
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

  public getAttrWithDistribution<Attr extends Attribute>(
    creature: Creature,
    attr: Attr,
  ): Attr extends TotalAttribute
    ? TotalAttributeWithDistribution
    : AttributeWithDistribution {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      const innerAttrs: AttributeWithDistribution[] = [];
      const value = this.calculateTotalAttr(attr, (locAttr) => {
        const attributeWithDistribution = this.getAttrWithDistribution(
          creature,
          locAttr,
        );
        innerAttrs.push(attributeWithDistribution);
        return attributeWithDistribution.value;
      });

      // TODO:
      return {
        value,
        innerAttrs,
        attr: attr,
      } as TotalAttributeWithDistribution as any;
    }

    const aggregator = this.getAggregatorForAttr(attr);

    const loadoutAttr = this.getLoadoutAttrWithDistribution(
      creature,
      attr as Exclude<Attribute, TotalAttribute>,
    );

    const modifierAttrWithDistribution =
      this.engine.modifierManager.calcAttrWithDistribution(
        creature,
        attr as Exclude<Attribute, TotalAttribute>,
        {
          aggregator: aggregator.aggregator,
          baseValue: loadoutAttr.value,
        },
      );

    return {
      ...modifierAttrWithDistribution,
      valueDistribution: [
        ...loadoutAttr.valueDistribution,
        ...modifierAttrWithDistribution.valueDistribution,
      ],
    } as AttributeWithDistribution as any;
  }
  public getLoadoutAttrWithDistribution<Attr extends Attribute>(
    creature: Creature,
    attr: Attr,
  ): Attr extends TotalAttribute
    ? TotalAttributeWithDistribution
    : AttributeWithDistribution {
    if (inArray(TOTAL_ATTRIBUTES, attr)) {
      const innerAttrs: AttributeWithDistribution[] = [];
      const value = this.calculateTotalAttr(attr, (locAttr) => {
        const attributeWithDistribution = this.getLoadoutAttrWithDistribution(
          creature,
          locAttr,
        );
        innerAttrs.push(attributeWithDistribution);
        return attributeWithDistribution.value;
      });

      // TODO:
      return {
        value,
        innerAttrs,
        attr: attr,
      } as TotalAttributeWithDistribution as any;
    }

    const aggregator = this.getAggregatorForAttr(attr);

    let result = aggregator.baseValue;
    const valueDistribution: AttributeDistribution[] = [];
    const ownAttributeValue = creature.getOwnAttr(attr);
    if (ownAttributeValue !== 0) {
      valueDistribution.push({
        value: ownAttributeValue,
        description: `${creature.name} own attribute`,
      });
    }

    if (creature instanceof Character) {
      const weaponAttributeValue = creature.weapon.getOwnAttr(attr);
      if (weaponAttributeValue !== 0) {
        valueDistribution.push({
          value: weaponAttributeValue,
          description: `${creature.name} weapon attribute`,
        });
      }
      const logisticsAttributeValue = creature.logistics?.getOwnAttr(attr) ?? 0;
      if (logisticsAttributeValue !== 0) {
        valueDistribution.push({
          value: logisticsAttributeValue,
          description: `${creature.name} logistics attribute`,
        });
      }
    }

    valueDistribution.forEach((attrDistribution) => {
      result = aggregator.aggregator(result, attrDistribution.value);
    });

    return {
      value: result,
      attr,
      valueDistribution,
    } as AttributeWithDistribution as any;
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
  "critDmg%",
] as const;
export const DAMAGE_ATTRIBUTES = [
  ...ATTRIBUTES_ELEMENTAL_DMG,
  ...ATTRIBUTES_SKILL_DMG,
  ...ATTRIBUTES_SHOT_DMG,
  "dmg%",
  "weaponCritDmg%",
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

export const ALL_PERCENT_ATTRIBUTES = [
  ...PERCENT_ATTRIBUTE,
  ...DAMAGE_ATTRIBUTES,
  ...FINAL_DAMAGE_ATTRIBUTES,
  ...RESISTANCE_ATTRIBUTES,
] as const;

export const HISTORY_ATTRIBUTES = [
  ...TOTAL_ATTRIBUTES,
  ...DAMAGE_ATTRIBUTES,
  ...FINAL_DAMAGE_ATTRIBUTES,
  ...RESISTANCE_ATTRIBUTES,
  "aligmentIndex",
  "weaponCritDmg%",
  "critDmg%",
  "sEnergyRecovery%",
  "uEnergyRecovery%",
  "healBonus%",
  "auxiliary%",
  "critRate",
  "skillHaste",
  "shield%",
] as const;

export type HistoryAttributes = (typeof HISTORY_ATTRIBUTES)[number];
export type TotalAttribute = (typeof TOTAL_ATTRIBUTES)[number];
export type Attribute = (typeof ATTRIBUTES)[number];
export type ElementType = (typeof ELEMENTS_TYPES)[number];
export type ShotType = (typeof SHOT_TYPES)[number];
export type SkillType = (typeof SKILL_TYPES)[number];
export type DamageType = ShotType | SkillType;
export type AttributesObj = {
  [stat in Attribute]?: number;
};
