export type SuggestionActionEvent =
  | KeyboardEvent
  | React.KeyboardEvent<HTMLInputElement>
  | React.MouseEvent<HTMLButtonElement, MouseEvent>;

export type Suggestion = {
  title?: string;
  extra?: string;
  onClick?: (e?: SuggestionActionEvent) => void;
};
