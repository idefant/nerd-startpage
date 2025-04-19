export const colorList = [
  'white',
  'red',
  'orange',
  'yellow',
  'green',
  'lightGreen',
  'lightBlue',
  'blue',
  'violet',
  'pink',
] as const;

export type Color = (typeof colorList)[number];
