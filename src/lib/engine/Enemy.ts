import { Creature } from "./Creature";
import type { Attribute } from "./AttributeManager";

export class Enemy extends Creature {
  protected loadoutAttrs: { [attr in Attribute]?: number } = {};

  public onBattleStart() {}

  public readonly name: string = "dummyEnemy";
}
