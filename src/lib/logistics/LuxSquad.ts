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
      description: "Lux Squad Heal Stack Gain",
      action: () => {
        this.currentStacks = Math.min(this.currentStacks + 1, this.maxStacks);
      },
    });
    this.actionIds.add(actionId);

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
        description: "Lux Squad Heal Stack Loss",
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
