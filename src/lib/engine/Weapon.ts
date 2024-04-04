import type { InitializedModifier, Modifier } from "./ModifierManager";
import type { Engine } from "./Engine";
import type { SubscriptionId } from "./SubscriptionManager";
import type { Attribute, ElementType, ShotType } from "./AttributeManager";
import type { WeaponType } from "./types";
import type { Character } from "./Character";

export abstract class Weapon {
  public abstract readonly element: ElementType;

  public abstract readonly type: WeaponType;

  public tier: 1 | 2 | 3 | 4 | 5 = 1;

  public lvl: 80 = 80;

  protected modifiers: Modifier[] = [];

  protected intializedModifiers: InitializedModifier[] = [];

  protected owner: Character | undefined;

  protected subscriptions: SubscriptionId[] = [];

  public rateOfFire: number = 0;

  public ammoCapacity: number = 0;

  public currentAmmo: number = 0;

  public compability: number = 0;

  public reloadSpd: number = 0;

  public loadoutAttrs: {
    [stat in Attribute]?: number;
  } = {};

  public constructor(protected engine: Engine) {}

  public equip(owner: Character) {
    this.owner = owner;
    this.intializedModifiers = this.modifiers.map((modifier) =>
      this.engine.modifierManager.initializeModifier(owner, modifier),
    );
  }

  public onBattleStart() {
    this.currentAmmo = this.ammoCapacity;
    this.intializedModifiers.forEach((modifier) =>
      this.engine.modifierManager.applyModifier(modifier),
    );
  }

  public unequip() {
    this.intializedModifiers.forEach((modifier) =>
      this.engine.modifierManager.removeModifier(modifier.id),
    );
    this.intializedModifiers = [];

    this.subscriptions.forEach((subscription) =>
      this.engine.subscriptionManager.unsubscribe(subscription),
    );
    this.subscriptions = [];
  }

  public abstract shot(type: ShotType): void;
  public abstract canShot(): boolean;

  public abstract reload(): void;
  public partialReload(): void {
    throw new Error("the weapon cant be partial reloaded");
  }

  public getOwnAttr(attr: Attribute): number {
    return this.loadoutAttrs[attr] ?? 0;
  }
}
