import type {
  CharId,
  LogisticSetName,
  WeaponName,
} from "~/app/utils/pickers/constants";
import type { Attribute } from "~/lib/engine/AttributeManager";

export type CharInfo = {
  id: CharId;
  manifestation: 0 | 1 | 2 | 3 | 4 | 5;
  lvl: 80;
};

export type WeaponInfo = {
  name: WeaponName;
  tier: 1 | 2 | 3 | 4 | 5;
  lvl: 80;
};

export type LogisticAttrWithValue =
  | {
      attr: Attribute;
      value: number;
    }
  | undefined;

export type LogisticInfo = {
  name: LogisticSetName | undefined;
  parts: [
    [LogisticAttrWithValue, LogisticAttrWithValue, LogisticAttrWithValue],
    [LogisticAttrWithValue, LogisticAttrWithValue, LogisticAttrWithValue],
    [LogisticAttrWithValue, LogisticAttrWithValue, LogisticAttrWithValue],
  ];
};

export type FullCharInfo = {
  char: CharInfo | undefined;
  weapon: WeaponInfo | undefined;
  logistics: LogisticInfo | undefined;
};
