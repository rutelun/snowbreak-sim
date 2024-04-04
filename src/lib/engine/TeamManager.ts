import type { Character } from "./Character";
import type { CooldownId } from "./CooldownManager";
import type { Engine } from "./Engine";
import type { Creature } from "./Creature";

// TODO: real numbers;
const SWAP_COOLDOWN = 2_000;
const SWAP_DURATION = 700;
export class TeamManager {
  private activeChar: Character | undefined = undefined;

  private team: Character[] = [];

  private swapCooldownId: CooldownId;

  public constructor(private engine: Engine) {
    this.swapCooldownId = this.engine.cooldownManager.createCooldownId();
  }

  public getActiveChar(): Character {
    if (!this.activeChar) {
      throw new Error("no active char");
    }

    return this.activeChar;
  }

  public getTeam(): Character[] {
    return this.team;
  }

  public addChar(char: Character) {
    this.team.push(char);
    if (!this.activeChar) {
      this.activeChar = char;
    }
  }

  public canSwapToChar(
    char: Character,
    ignoreCooldown: boolean = false,
  ): boolean {
    if (!this.team.includes(char)) {
      return false;
    }

    if (ignoreCooldown) {
      return true;
    }

    return this.engine.cooldownManager.isCooldownEnd(this.swapCooldownId);
  }

  public isInTeam(creature: Creature): boolean {
    return (this.team as Creature[]).includes(creature);
  }

  public instantSwapToCharIgnoringCooldown(char: Character) {
    if (!this.canSwapToChar(char, true)) {
      throw new Error("cant swap to char");
    }

    this.activeChar = char;
  }

  public swapToChar(char: Character) {
    if (!this.canSwapToChar(char)) {
      throw new Error("cant swap to char");
    }

    this.engine.timeManager.doAction({
      action: () => {
        this.activeChar = char;
        this.engine.cooldownManager.startCooldown(
          this.swapCooldownId,
          SWAP_COOLDOWN,
        );
      },
      caster: char,
      description: "char swap",
      isDurationConfirmed: false,
      duration: SWAP_DURATION,
    });
  }
}
