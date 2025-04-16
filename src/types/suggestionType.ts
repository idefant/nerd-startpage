export type Suggestion = {
  title?: string;
  extra?: string;
  onClick?: (
    e?: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => void;
};
