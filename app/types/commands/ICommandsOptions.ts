import type { CommandType } from "./CommandTypeEnum";

export interface ICommandsOptions {
    name: string,
    description: string,
    type: CommandType,
}