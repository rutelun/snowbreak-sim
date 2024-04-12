import { ShotgunWeapon } from "../../engine/ShotgunWeapon";
import type { Weapon } from "~/lib/engine/Weapon";

export class DummyWeapon extends ShotgunWeapon {
  public static override type = "shotgun" as const;

  public static override element = "kinetic" as const;
  public static override name: "Dummy Weapon";
  protected override class: typeof Weapon = DummyWeapon;
}
