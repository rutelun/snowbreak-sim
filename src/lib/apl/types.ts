export type AplActionBase = {
  name: string;
  canPerformAction: () => boolean;
  action: () => void;
};

export type AplAction = AplActionBase & {
  disabled: boolean;
  options?: unknown;
};
