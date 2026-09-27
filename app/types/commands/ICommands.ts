import type { CommandType } from "./CommandTypeEnum";
import type { CodeCraftersCli } from "@/classes/client";

export interface ICommands {
    client: CodeCraftersCli,
    name: string,
    description: string,
    type: CommandType,

    run: (...args: any[]) => Promise<void>;
}
