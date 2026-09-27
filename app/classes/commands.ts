import { CommandType } from "@/types/commands/CommandTypeEnum";
import { type ICommands } from "@/types/commands/ICommands";
import { type ICommandsOptions } from "@/types/commands/ICommandsOptions";
import type { CodeCraftersCli } from "./client";

class Commands implements ICommands {
    client: CodeCraftersCli;
    name: string;
    description: string;
    type: CommandType;

    constructor(client: CodeCraftersCli, options: ICommandsOptions ) {
        this.client = client
        this.name = options.name
        this.description = options.description
        this.type = options.type
    }

    public async run(...args: any[]): Promise<void> {
        throw Error("[ERROR] Not implemented yet!");
    }
}

export { Commands }