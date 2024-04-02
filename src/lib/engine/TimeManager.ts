import type { Engine } from "./Engine";

type BattleTime = number;

export type ActionId = Symbol;

type PlannedActionBase = {
  battleTime: BattleTime;
  action: () => void;
  actionId: ActionId;
  description: string;
};

type PlannedActionInitBase = {
  action: () => void;
  description: string;
};

type PlannedActionRegularSpecific = {
  type: "interval";
  options: {
    tickInterval: number;
  };
};
type PlannedActionRegular = PlannedActionBase & PlannedActionRegularSpecific;
type PlannedActionInitRegular = PlannedActionInitBase &
  PlannedActionRegularSpecific;

type PlannedActionOnceSpecific = {
  type: "once";
};

type PlannedActionOnce = PlannedActionBase & PlannedActionOnceSpecific;
type PlannedActionInitOnce = PlannedActionInitBase &
  PlannedActionOnceSpecific & {
    waitingDuration: number;
  };

type PlannedAction = PlannedActionRegular | PlannedActionOnce;
type PlannedActionInit = PlannedActionInitRegular | PlannedActionInitOnce;

type RegularAction = {
  duration: number;
  isDurationConfirmed: boolean;
  action: () => void;
  description: string;
};

export class TimeManager {
  private battleTime: BattleTime = 0;

  private plannedActionQueue: PlannedAction[] = [];

  public constructor(private engine: Engine) {}

  private doPlannedActions(untilBattleTime: BattleTime) {
    const maxIndex =
      this.plannedActionQueue.findIndex(
        (plannedAction) => plannedAction.battleTime > untilBattleTime,
      ) - 1;
    for (let i = 0; i <= maxIndex; i += 1) {
      const plannedAction = this.plannedActionQueue[i];
      if (!plannedAction) {
        throw new Error("no planned action");
      }

      this.battleTime = plannedAction.battleTime;
      plannedAction.action();
      switch (plannedAction.type) {
        case "interval":
          this.addPlannedActionInQueue({
            ...plannedAction,
            battleTime:
              plannedAction.battleTime + plannedAction.options.tickInterval,
          });
          break;
        default:
          break;
      }
    }

    this.plannedActionQueue.splice(0, maxIndex);
  }

  private addPlannedActionInQueue(plannedAction: PlannedAction) {
    const index = this.plannedActionQueue.findIndex(
      (item) => item.battleTime > plannedAction.battleTime,
    );
    if (index !== -1) {
      this.plannedActionQueue.splice(index, 0, plannedAction);
    } else {
      this.plannedActionQueue.push(plannedAction);
    }
  }

  public getBattleTime() {
    return this.battleTime;
  }

  public doAction(action: RegularAction) {
    const currentBattleTime = this.battleTime;
    this.doPlannedActions(Math.max(this.battleTime, this.battleTime));

    action.action();
    this.battleTime = currentBattleTime + action.duration;

    const afterActionBattleTime = this.battleTime;
    this.doPlannedActions(this.battleTime);
    this.battleTime = afterActionBattleTime;
  }

  public addPlannedAction(action: PlannedActionInit) {
    let plannedAction: PlannedAction | undefined;
    const actionId = Symbol("actionId");
    switch (action.type) {
      case "interval":
        plannedAction = {
          ...action,
          actionId,
          battleTime: this.getBattleTime() + action.options.tickInterval,
        };
        break;
      case "once":
        plannedAction = {
          ...action,
          actionId,
          battleTime: this.getBattleTime() + action.waitingDuration,
        };
        break;
      default:
        throw new Error("unknown type");
    }

    this.addPlannedActionInQueue(plannedAction);

    return actionId;
  }

  public deletePlannedAction(actionId: ActionId) {
    const index = this.plannedActionQueue.findIndex(
      (item) => item.actionId === actionId,
    );
    if (index !== -1) {
      this.plannedActionQueue.splice(index, 1);
    }
  }

  public getTimeUntilPlannedAction(actionId: ActionId): number {
    const plannedAction = this.plannedActionQueue.find(
      (item) => item.actionId === actionId,
    );
    if (!plannedAction) {
      throw new Error("no planned action");
    }

    return Math.max(plannedAction.battleTime - this.getBattleTime(), 0);
  }

  public startBattle() {
    this.engine.teamManager.getTeam().forEach((char) => char.onBattleStart());
    this.engine.getEnemy().onBattleStart();
  }
}
