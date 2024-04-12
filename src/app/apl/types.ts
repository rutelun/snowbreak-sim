import type { Engine } from "~/lib/engine/Engine";

export type AplConditionSelectBase = {
  type: "select";
  id: string;
  description: string;
  check: (engine: Engine, value: string) => boolean;
  options: string[];
};

export type AplConditionSelect = AplConditionSelectBase & {
  currentValue: string | undefined;
};

export type AplConditionSelectUi = {
  id: string;
  description: string;
  currentValue: string | undefined;
  options: string[];
  type: "select";
  enabled: boolean;
};

export type AplConditionComparatorBase = {
  type: "comparator";
  id: string;
  description: string;
  getValue: (engine: Engine) => number;
  suffix?: string;
};

export type AplConditionComparatorUi = {
  id: string;
  description: string;
  type: "comparator";
  comparisonType: ">=" | "<=";
  comparisonValue: number | undefined;
  enabled: boolean;
};

export type AplConditionComparator = AplConditionComparatorBase & {
  comparisonType: ">=" | "<=";
  comparisonValue: number | undefined;
};

export type AplConditionBase =
  | AplConditionSelectBase
  | AplConditionComparatorBase;

export type AplCondition = AplConditionSelect | AplConditionComparator;

export type AplConditionUi = AplConditionSelectUi | AplConditionComparatorUi;

export type AplAction = {
  id: string;
  description: string;
  action: (engine: Engine) => void;
  check?: (engine: Engine) => boolean;
};

export type AplActionUi = {
  id: string;
  description: string;
  enabled: boolean;
};

export type AplActionWithConditionsUi = {
  action: AplActionUi;
  conditions: AplConditionUi[];
};

export type AplActionWithConditions = {
  action: AplAction;
  conditions: AplCondition[];
};
