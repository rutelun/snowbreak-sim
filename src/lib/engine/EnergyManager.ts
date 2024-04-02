export type EnergyType = "SEnergy" | "UEnergy";
export class EnergyManager {
  private maxEnergy: number;

  private currentEnergy: number;

  public constructor(energyType: EnergyType) {
    if (energyType === "SEnergy") {
      this.maxEnergy = 50;
      // TODO: s energy start?
      this.currentEnergy = 20;
    } else {
      this.maxEnergy = 100;
      this.currentEnergy = 0;
    }
  }

  public generate(count: number): void {
    this.currentEnergy = Math.max(this.currentEnergy + count, this.maxEnergy);
  }

  public canSpent(count: number): boolean {
    return this.currentEnergy >= count;
  }

  public spent(count: number): void {
    if (!this.canSpent(count)) {
      throw new Error("cant spent energy");
    }

    this.currentEnergy = Math.max(this.currentEnergy - count, 0);
  }

  public getCurrent(): number {
    return this.currentEnergy;
  }
}
