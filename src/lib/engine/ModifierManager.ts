import type { Creature } from "./Creature";
import type { Engine } from "./Engine";
import type { TargetOptions } from "./TargetManager";
import type { ActionId } from "./TimeManager";
import type {
  Attribute,
  AttributeAggregator,
  AttributeDistribution,
  AttributeWithDistribution,
  FormulaAggregator,
  TotalAttribute,
} from "./AttributeManager";
import type { SimpleTargetType } from "./types";
import type { SimpleFormulaPart } from "~/lib/engine/Formula";

export type ModifierId = Symbol;

export type ModifierDuration =
  | { durationType: "permanent" }
  | { durationType: "time"; duration: number };

type CalcValueOptions = {
  owner: Creature;
  creator: Creature;
};

type ModifierValue =
  | { value: number }
  | { getValue: (options: CalcValueOptions) => number };

type ModifierTarget = SimpleTargetType | "creator";

export type Modifier = {
  name: string;
  unique: boolean;
  attr?: Attribute;
  target: ModifierTarget;
  init?: (self: InitializedModifier) => void;
  destroy?: (self: InitializedModifier) => void;
} & ModifierDuration &
  ModifierValue;

export type InitializedModifier = Modifier & {
  id: ModifierId;
  creator: Creature;
};

export class ModifierManager {
  private modifiers: Map<Creature, Map<ModifierId, InitializedModifier>> =
    new Map();

  private deleteModifiers: Map<ModifierId, Map<Creature, () => void>> =
    new Map();

  private modifiersPlannedActions: Map<ModifierId, ActionId> = new Map();

  public constructor(private engine: Engine) {}

  // todo: stackable mods, refresh mods, etc
  public applyModifier(modifier: InitializedModifier) {
    const targetOptions: TargetOptions =
      modifier.target === "creator"
        ? { targetType: "creature", targetValue: modifier.creator }
        : { targetType: modifier.target };

    this.removeModifier(modifier.id);

    const targets = this.engine.targetManager.getTargets(targetOptions);
    targets.forEach((target) => {
      if (modifier.unique) {
        const oldModifier = this.getModifierByName(target, modifier.name);
        if (oldModifier) {
          this.deleteModifiers.get(oldModifier.id)?.get(target)?.();
          this.deleteModifiers.get(oldModifier.id)?.delete(target);
        }
      }
      if (!this.modifiers.has(target)) {
        this.modifiers.set(target, new Map());
      }

      this.modifiers.get(target)?.set(modifier.id, modifier);
      if (!this.deleteModifiers.has(modifier.id)) {
        this.deleteModifiers.set(modifier.id, new Map());
      }
      this.deleteModifiers
        .get(modifier.id)
        ?.set(target, () => this.modifiers.get(target)?.delete(modifier.id));
    });

    if (modifier.durationType === "time") {
      const actionId = this.engine.timeManager.addPlannedAction({
        type: "once",
        description: `expire ${modifier.name}`,
        waitingDuration: modifier.duration,
        action: () => this.removeModifier(modifier.id),
      });

      this.modifiersPlannedActions.set(modifier.id, actionId);
    }
  }

  public getModifierByName(
    creature: Creature,
    modifierName: string,
  ): InitializedModifier | undefined {
    return [...(this.modifiers.get(creature)?.values() ?? [])].find(
      (modifier) => modifier.name === modifierName,
    );
  }

  public hasModifierByName(creature: Creature, modifierName: string): boolean {
    return !!this.getModifierByName(creature, modifierName);
  }

  private calcModifierValue(
    owner: Creature,
    modifier: InitializedModifier,
  ): number {
    if ("value" in modifier) {
      return modifier.value;
    }

    return modifier.getValue({
      owner,
      creator: modifier.creator,
    });
  }

  public calcAttr(
    creature: Creature,
    attr: Attribute,
    aggregator: AttributeAggregator,
  ): number {
    let result = aggregator.baseValue;
    this.modifiers.get(creature)?.forEach((modifier) => {
      if (modifier.attr === attr) {
        result = aggregator.aggregator(
          result,
          this.calcModifierValue(creature, modifier),
        );
      }
    });

    return result;
  }

  public getAttrFormulaParts(
    creature: Creature,
    attr: Attribute,
  ): SimpleFormulaPart[] {
    let parts: SimpleFormulaPart[] = [];
    this.modifiers.get(creature)?.forEach((modifier) => {
      if (modifier.attr === attr) {
        const value = this.calcModifierValue(creature, modifier);
        if (value !== 0) {
          parts.push({
            value,
            description: modifier.name,
          });
        }
      }
    });

    return parts;
  }

  public calcAttrWithDistribution(
    creature: Creature,
    attr: Exclude<Attribute, TotalAttribute>,
    aggregator: AttributeAggregator,
  ): AttributeWithDistribution {
    let totalValue = aggregator.baseValue;
    let distribution: AttributeDistribution[] = [];

    this.modifiers.get(creature)?.forEach((modifier) => {
      if (modifier.attr === attr) {
        const value = this.calcModifierValue(creature, modifier);
        totalValue = aggregator.aggregator(totalValue, value);

        if (value !== 0) {
          distribution.push({
            value,
            description: modifier.name,
          });
        }
      }
    });

    return {
      value: totalValue,
      attr,
      valueDistribution: distribution,
    };
  }

  public initializeModifier(
    creator: Creature,
    modifier: Modifier,
  ): InitializedModifier {
    return {
      ...modifier,
      creator,
      id: Symbol("modifierId"),
    };
  }

  public removeModifier(modifierId: ModifierId) {
    this.deleteModifiers.get(modifierId)?.forEach((deleter) => deleter());
    this.deleteModifiers.delete(modifierId);
    this.modifiersPlannedActions.delete(modifierId);
  }
}
