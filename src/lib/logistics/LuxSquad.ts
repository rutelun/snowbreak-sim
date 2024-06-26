import { LogisticSet } from "../engine/LogisticSet";
import type { Engine } from "../engine/Engine";
import type { AttributesObj } from "../engine/AttributeManager";
import type { InitializedModifier, Modifier } from "../engine/ModifierManager";
import type { ActionId } from "../engine/TimeManager";
import type { Character } from "../engine/Character";
import type {
  SubscriptionId,
  Subscriptions,
} from "../engine/SubscriptionManager";

export class LuxSquad extends LogisticSet {
  public static override readonly logisticName = "Lux Squad";
  protected class: typeof LogisticSet = LuxSquad;

  private maxStacks = 10;

  private currentStacks = 0;

  private healBonusPerStack = 5;

  private tickInterval = 1_000;

  private clearAfterUsingSkillTime = 2_000;

  private modifier: Modifier = {
    name: "Lux Squad Heal Effect",
    durationType: "permanent",
    unique: true,
    target: "creator",
    attr: "healBonus%",
    getValue: () => this.currentStacks * this.healBonusPerStack,
  };

  private initializedModifier: InitializedModifier | undefined = undefined;

  private actionIds: Set<ActionId> = new Set();

  private subscriptions: Set<SubscriptionId> = new Set();

  public constructor(engine: Engine, parts: AttributesObj[]) {
    super(engine, parts);
    this.loadoutAttrs["healBonus%"] =
      (this.loadoutAttrs["healBonus%"] ?? 0) + 24;
  }

  public unequip() {
    this.subscriptions.forEach((subscription) => {
      this.engine.subscriptionManager.unsubscribe(subscription);
    });

    this.subscriptions = new Set();

    if (this.initializedModifier) {
      this.engine.modifierManager.removeModifier(this.initializedModifier.id);
      this.initializedModifier = undefined;
    }

    super.unequip();
  }

  public equip(owner: Character) {
    super.equip(owner);
    this.initializedModifier = this.engine.modifierManager.initializeModifier(
      owner,
      this.modifier,
    );
  }

  public onBattleStart() {
    super.onBattleStart();
    if (!this.initializedModifier) {
      throw new Error("no initialized modifier");
    }
    this.engine.modifierManager.applyModifier(this.initializedModifier);

    const actionId = this.engine.timeManager.addPlannedAction({
      type: "interval",
      options: {
        tickInterval: this.tickInterval,
      },
      description: "Lux Squad heal stack gain",
      action: () => {
        this.currentStacks = Math.min(this.currentStacks + 1, this.maxStacks);
      },
    });
    this.actionIds.add(actionId);

    const onBeforeSkillUsed = ({
      skillType,
      caster,
    }: Subscriptions["onBeforeSkillUsed"]) => {
      if (caster !== this.owner) {
        return;
      }

      if (skillType === "ultimateSkill") {
        this.currentStacks = this.maxStacks;
      }
    };

    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe(
        "onBeforeSkillUsed",
        onBeforeSkillUsed,
      ),
    );

    const onSkillUsed = ({
      skillType,
      caster,
    }: Subscriptions["onSkillUsed"]) => {
      if (caster !== this.owner) {
        return;
      }

      if (skillType === "ultimateSkill") {
        this.currentStacks = this.maxStacks;
      }

      const locActionId = this.engine.timeManager.addPlannedAction({
        type: "once",
        description: "Lux Squad heal stacks loss",
        waitingDuration: this.clearAfterUsingSkillTime,
        action: () => {
          this.currentStacks = 0;
        },
      });
      this.actionIds.add(locActionId);
    };

    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe("onSkillUsed", onSkillUsed),
    );
  }
}
