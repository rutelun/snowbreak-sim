import { CharacterWithShot } from "./CharacterWithShot";
import type { Weapon } from "../Weapon";
import type { LogisticSet } from "../LogisticSet";
import type { Engine } from "../Engine";
import { DummyWeapon } from "../../weapons/shotguns/DummyWeapon";

type Manifestation = 0 | 1 | 2 | 3 | 4 | 5;
type CharacterLvl = 70 | 80;
export type CharacterOpts = {
  lvl: CharacterLvl;
  manifestation: Manifestation;
};

export abstract class Character extends CharacterWithShot {
  public override weapon: Weapon;

  public logistics: LogisticSet | undefined = undefined;

  public constructor(engine: Engine, opts: CharacterOpts) {
    super(engine, opts);
    this.weapon = new DummyWeapon(this.engine);
    this.weapon.equip(this);

    this.engine.teamManager.addChar(this);
  }

  public equipWeapon(weapon: Weapon) {
    if (this.weaponType !== weapon.type) {
      throw new Error("bad weapon type");
    }
    this.weapon = weapon;
    this.weapon.equip(this);
  }

  public equipLogistics(logistics: LogisticSet) {
    this.logistics = logistics;
    this.logistics.equip(this);
  }

  public override onBattleStart() {
    super.onBattleStart();

    this.weapon.onBattleStart();
    this.logistics?.onBattleStart();
  }
}
