import { LogisticSet } from "../engine/LogisticSet";
import type { Engine } from "../engine/Engine";
import type { AttributesObj } from "../engine/AttributeManager";
import type { InitializedModifier, Modifier } from "../engine/ModifierManager";
import type { Character } from "../engine/Character";
import type {
  SubscriptionId,
  Subscriptions,
} from "../engine/SubscriptionManager";

export class AmanoIwato extends LogisticSet {
  private maxStacks = 5;

  public static override readonly logisticName = "Amano-Iwato";
  protected class: typeof LogisticSet = AmanoIwato;

  private currentStacks = 0;

  private adsBallisticDmgPerStack = 10;

  private modifier: Modifier = {
    name: "Amano Iwato 3pc effect",
    durationType: "permanent",
    unique: true,
    target: "creator",
    attr: "adsDmg%",
    getValue: () => this.currentStacks * this.adsBallisticDmgPerStack,
  };

  private initializedModifier: InitializedModifier | undefined = undefined;

  private subscriptions: Set<SubscriptionId> = new Set();

  public constructor(engine: Engine, parts: AttributesObj[]) {
    super(engine, parts);
    this.loadoutAttrs["ballisticDmg%"] =
      (this.loadoutAttrs["ballisticDmg%"] ?? 0) + 24;
  }

  public equip(owner: Character) {
    super.equip(owner);
    this.initializedModifier = this.engine.modifierManager.initializeModifier(
      owner,
      this.modifier,
    );
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

  public onBattleStart() {
    super.onBattleStart();
    if (!this.initializedModifier) {
      throw new Error("no initialized modifier");
    }
    this.engine.modifierManager.applyModifier(this.initializedModifier);

    const onDamageDealt = ({
      caster,
      critRateFormula,
    }: Subscriptions["onDamageDealt"]) => {
      if (caster !== this.owner) {
        return;
      }

      const critRate = critRateFormula.cachedResult ?? 0;

      this.currentStacks = Math.min(
        this.currentStacks + critRate,
        this.maxStacks,
      );
    };

    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe("onDamageDealt", onDamageDealt),
    );

    const onSwap = ({
      previousActive,
      currentActive,
    }: Subscriptions["onSwap"]) => {
      if (previousActive === this.owner && currentActive !== previousActive) {
        this.currentStacks = 0;
      }
    };

    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe("onSwap", onSwap),
    );
  }
}
