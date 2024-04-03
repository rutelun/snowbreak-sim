export type SimpleFormulaPart = {
  value: number;
  description: string | undefined;
  visibleAsPercent?: boolean;
};
export type FormulaPart = Formula | SimpleFormulaPart;

type Action = "+" | "*" | "/" | "-";

type FormulaOpts = {
  parts: FormulaPart[];
  description: string | undefined;
  action: Action;
  visibleAsPercent?: boolean;
  baseResult?: number;
  baseResultVisible?: boolean;
};

export class Formula {
  public parts: FormulaPart[];
  public description: string | undefined;
  public action: Action;
  public visibleAsPercent: boolean | undefined;
  public baseResult: number | undefined;
  public baseResultVisible: boolean;
  public cachedResult: number | undefined = undefined;

  public constructor(opts: FormulaOpts) {
    this.parts = opts.parts;
    this.action = opts.action;
    this.description = opts.description;
    this.visibleAsPercent = opts.visibleAsPercent;
    this.baseResult = opts.baseResult;
    this.baseResultVisible = opts.baseResultVisible ?? false;
  }

  public calc(): number {
    this.cachedResult = this.calcWithoutStoreCached();
    return this.cachedResult;
  }

  protected calcWithoutStoreCached(): number {
    if (this.parts.length === 0) {
      if (this.baseResult !== undefined) {
        return this.baseResult;
      } else {
        throw new Error("no parts");
      }
    }
    const [firstPart, ...otherParts] = this.parts.map((part) => {
      if (part instanceof Formula) {
        return part.calc();
      }

      return part.value;
    });
    let result = firstPart;
    let aggregator: (result: number, item: number) => number;
    switch (this.action) {
      case "*":
        aggregator = (locResult, item) => locResult * item;
        break;
      case "+":
        aggregator = (locResult, item) => locResult + item;
        break;
      case "-":
        aggregator = (locResult, item) => locResult - item;
        break;
      case "/":
        aggregator = (locResult, item) => locResult / item;
        break;
    }

    otherParts.forEach((part) => {
      result = aggregator(result, part);
    });

    return result;
  }
}
