import { ShotgunWeapon } from "../../engine/ShotgunWeapon";

export class DummyWeapon extends ShotgunWeapon {
  type = "shotgun" as const;

  element = "kinetic" as const;

  public override readonly tier = 1;
}
