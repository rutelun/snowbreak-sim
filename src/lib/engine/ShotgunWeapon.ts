import { Weapon } from "./Weapon";
import type { WeaponType } from "./types";
import type { ShotType } from "./AttributeManager";

const PALLETS_PER_SHOT = 8;

const ENERGY_PER_PALLET_FOR_RATE_OF_FIRE = new Map([
  [60, 0.29],
  [75, 0.24],
  [120, 0.4],
]);

export abstract class ShotgunWeapon extends Weapon {
  public override readonly type: WeaponType = "shotgun";

  public override shot(type: ShotType) {
    const makeShot = () => {
      if (!this.owner) {
        throw new Error("no owner");
      }

      for (let i = 0; i < PALLETS_PER_SHOT; i += 1) {
        this.engine.damageAndHealManager.dealDamage({
          targetOptions: {
            targetType: "enemy",
          },
          element: this.element,
          damageType: type,
          caster: this.owner,
          value: {
            type: "atkBased",
            percent: this.compability,
          },
        });

        const energyGain = ENERGY_PER_PALLET_FOR_RATE_OF_FIRE.get(
          this.rateOfFire,
        );
        if (!energyGain) {
          throw new Error("unknown energy gain for the rate of fire");
        }

        this.owner?.generateUEnergy(energyGain);
      }

      this.currentAmmo = Math.max(this.currentAmmo - 1, 0);
    };

    this.engine.timeManager.doAction({
      action: makeShot,
      duration: (60 / this.rateOfFire) * 1_000,
      isDurationConfirmed: true,
      description: `Shotgun ${type} shot`,
      caster: this.owner,
    });
  }

  public override reload() {
    while (this.currentAmmo < this.ammoCapacity) {
      this.partialReload();
    }
  }

  public override canReload(): boolean {
    return this.currentAmmo < this.ammoCapacity;
  }

  public override partialReload() {
    if (this.currentAmmo >= this.ammoCapacity) {
      return;
    }

    this.engine.timeManager.doAction({
      action: () => {
        this.currentAmmo += 1;
      },
      duration: (this.reloadSpd / this.ammoCapacity) * 1_000,
      isDurationConfirmed: true,
      description: "Partial shotgun reload",
      caster: this.owner,
    });
  }

  public override canShot(): boolean {
    return this.currentAmmo > 0;
  }
}
