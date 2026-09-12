import { modeNameList } from '#data/mode';

export type ModeName = (typeof modeNameList)[number];

export type Mode = {
  title: string;
  icon: string;
};
