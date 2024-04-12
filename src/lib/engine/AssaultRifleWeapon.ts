import { Weapon } from "./Weapon";
import type { WeaponType } from "./types";
import type { ShotType } from "./AttributeManager";

export abstract class AssaultRifleWeapon extends Weapon {
  public static override readonly type: WeaponType = "assaultRifle";

  public override shot(_type: ShotType) {
    throw new Error("shot isnt implemented");
  }

  public override reload() {
    throw new Error("reload isnt implemented");
  }

  public override partialReload() {
    throw new Error("partial reload isnt implemented");
  }

  public override canShot(): boolean {
    return this.currentAmmo > 0;
  }
}
