import type { Character } from "./Character";
import type { Attribute, AttributesObj } from "./AttributeManager";
import type { Engine } from "./Engine";

export abstract class LogisticSet {
  public loadoutAttrs: AttributesObj = {
    defBase: 50 + 50,
    atkBase: 99 + 99,
    hpBase: 1483 + 1483,
    "hp%": 20,
    "atk%": 20,
    "def%": 20,
  };

  protected owner: Character | undefined = undefined;

  public constructor(
    protected engine: Engine,
    private parts: AttributesObj[],
  ) {}

  public getOwnAttr(attr: Attribute): number {
    return (
      (this.loadoutAttrs[attr] ?? 0) +
      this.parts.reduce((res, part) => res + (part[attr] ?? 0), 0)
    );
  }

  public equip(owner: Character): void {
    this.owner = owner;
  }

  public unequip(): void {
    this.owner = undefined;
  }

  public onBattleStart(): void {}
}
