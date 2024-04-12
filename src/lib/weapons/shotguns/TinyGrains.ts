import type { Character } from "../../engine/Character";
import { ShotgunWeapon } from "../../engine/ShotgunWeapon";
import type {
  InitializedModifier,
  Modifier,
} from "../../engine/ModifierManager";
import type { Engine } from "../../engine/Engine";
import type { ActionId } from "../../engine/TimeManager";
import type { ElementType } from "../../engine/AttributeManager";
import { getValueByWeaponTier } from "~/lib/utils/getValueByWeaponTier";
import type { Weapon, WeaponOpts } from "~/lib/engine/Weapon";

export class TinyGrains extends ShotgunWeapon {
  public static override readonly element: ElementType = "kinetic";
  public static override readonly weaponName = "Tiny Grains";
  protected override class: typeof Weapon = TinyGrains;
  public static override readonly rarity = 5;

  private plannedAction: ActionId | undefined = undefined;

  private atk = [18, 30];
  private damageTaken = [9.6, 16];

  protected override modifiers: Modifier[] = [
    {
      name: "Tiny Grains atk",
      durationType: "permanent",
      unique: true,
      target: "creator",
      attr: "atk%",
      getValue: () => getValueByWeaponTier(this.atk, this.tier),
    },
  ];

  private dmgTakenModifier: Modifier = {
    name: "Tiny Grains atk",
    durationType: "time",
    duration: 3_000,
    unique: true,
    target: "enemy",
    attr: "damageTaken%",
    getValue: () => getValueByWeaponTier(this.damageTaken, this.tier),
  };

  private dmgTakenModifierInitialized: InitializedModifier | undefined =
    undefined;

  public constructor(engine: Engine, opts: WeaponOpts) {
    super(engine, opts);
    this.rateOfFire = 60;
    this.ammoCapacity = 7;
    this.compability = 41;
    this.reloadSpd = 2.62;
    this.loadoutAttrs = {
      atkBase: 811,
      "atk%": 52,
      "weaponCritDmg%": 30,
      critRate: 25,
    };
  }

  public override equip(owner: Character) {
    super.equip(owner);

    this.dmgTakenModifierInitialized =
      this.engine.modifierManager.initializeModifier(
        owner,
        this.dmgTakenModifier,
      );
  }

  public override onBattleStart() {
    super.onBattleStart();
    const subscription = this.engine.subscriptionManager.subscribe(
      "onDamageDealt",
      ({ target }) => {
        if (target !== this.owner || !this.dmgTakenModifierInitialized) {
          return;
        }

        this.engine.modifierManager.applyModifier(
          this.dmgTakenModifierInitialized,
        );
      },
    );
    this.subscriptions.push(subscription);
  }

  public override unequip() {
    if (this.plannedAction) {
      this.engine.timeManager.deletePlannedAction(this.plannedAction);
    }

    super.unequip();
  }
}
