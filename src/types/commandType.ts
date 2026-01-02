import { commandNameList } from '#data/command';

export type CommandName = (typeof commandNameList)[number];

export type Command = { title: string };
