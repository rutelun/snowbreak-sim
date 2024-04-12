import { LogisticSet } from "~/lib/engine/LogisticSet";
import type {
  InitializedModifier,
  Modifier,
} from "~/lib/engine/ModifierManager";
import type {
  SubscriptionId,
  Subscriptions,
} from "~/lib/engine/SubscriptionManager";
import type { Engine } from "~/lib/engine/Engine";
import type { AttributesObj } from "~/lib/engine/AttributeManager";
import type { Character } from "~/lib/engine/Character";

export class Amarna extends LogisticSet {
  private ballisticDmg = 30;
  private atk = 20;

  public static override readonly logisticName = "Amarna";
  protected class: typeof LogisticSet = Amarna;

  private atkModifier: Modifier = {
    name: "Amarna 3pc atk%",
    durationType: "time",
    duration: 1_500,
    unique: true,
    target: "activeChar",
    attr: "atk%",
    getValue: () => this.atk,
  };

  public static ballisticModifierName = "Amarna 3pc dmg%";

  private ballisticDmgModifier: Modifier = {
    name: Amarna.ballisticModifierName,
    durationType: "time",
    duration: 15_000,
    unique: true,
    target: "team",
    attr: "ballisticDmg%",
    getValue: () => this.ballisticDmg,
    destroy: () => {
      if (this.initializedAtkModifier) {
        this.engine.modifierManager.removeModifier(
          this.initializedAtkModifier.id,
        );
      }
    },
  };

  private initializedBallisticModifier: InitializedModifier | undefined =
    undefined;
  private initializedAtkModifier: InitializedModifier | undefined = undefined;

  private subscriptions: Set<SubscriptionId> = new Set();

  public constructor(engine: Engine, parts: AttributesObj[]) {
    super(engine, parts);
    this.loadoutAttrs["ballisticDmg%"] =
      (this.loadoutAttrs["ballisticDmg%"] ?? 0) + 24;
  }

  public equip(owner: Character) {
    super.equip(owner);
    this.initializedBallisticModifier =
      this.engine.modifierManager.initializeModifier(
        owner,
        this.ballisticDmgModifier,
      );
    this.initializedAtkModifier =
      this.engine.modifierManager.initializeModifier(owner, this.atkModifier);
  }

  public unequip() {
    this.subscriptions.forEach((subscription) => {
      this.engine.subscriptionManager.unsubscribe(subscription);
    });
    this.subscriptions = new Set();

    if (this.initializedAtkModifier) {
      this.engine.modifierManager.removeModifier(
        this.initializedAtkModifier.id,
      );
      this.initializedAtkModifier = undefined;
    }
    if (this.initializedBallisticModifier) {
      this.engine.modifierManager.removeModifier(
        this.initializedBallisticModifier.id,
      );
      this.initializedBallisticModifier = undefined;
    }
    super.unequip();
  }

  public onBattleStart() {
    super.onBattleStart();
    if (!this.initializedBallisticModifier) {
      throw new Error("no initialized ballisticDmgModifier");
    }

    const onSkillUsed = ({
      caster,
      skillType,
    }: Subscriptions["onSkillUsed"]) => {
      if (caster !== this.owner || skillType !== "supportSkill") {
        return;
      }

      if (!this.initializedBallisticModifier) {
        throw new Error("no initializedBallisticModifier");
      }

      this.engine.modifierManager.applyModifier(
        this.initializedBallisticModifier,
      );
    };

    const onDamageDealt = ({
      caster,
      damageType,
    }: Subscriptions["onDamageDealt"]) => {
      if (caster !== this.owner || damageType !== "supportSkill") {
        return;
      }

      if (!this.initializedAtkModifier) {
        throw new Error("no initializedAtkModifier");
      }

      this.engine.modifierManager.applyModifier(this.initializedAtkModifier);
    };

    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe("onSkillUsed", onSkillUsed),
    );
    this.subscriptions.add(
      this.engine.subscriptionManager.subscribe("onDamageDealt", onDamageDealt),
    );
  }
}
