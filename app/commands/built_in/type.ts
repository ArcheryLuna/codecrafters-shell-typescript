import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import path from "node:path";
import { stdout } from "node:process";
import fs from "node:fs"
import { exec } from "node:child_process";

class Type extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'type',
            description: 'Tells you the type of command that this is.',
            type: CommandType.BUILTIN,
        })
    }

    private find_command_type(input: string): CommandType | string | undefined {
       const builtin = this.find_built_in_commands(input);
        
        if (builtin !== undefined) return builtin;

       return this.find_commands_via_path(input);
    }

    private find_built_in_commands(input: string): CommandType | undefined {
        return this.client.commands.get(input)?.type;
    }

    private find_commands_via_path(input: string): string | undefined {
        const PATH_ENV: string[] = process.env.PATH?.split(path.delimiter) ?? [];
        
        for ( const dir of PATH_ENV) {
            const fullPath = path.join(dir, input);

            try {
                fs.accessSync(fullPath, fs.constants.X_OK);
                if (fs.statSync(fullPath).isFile()) return fullPath;
            } catch {
                // Normal: Continue searching the remainding PATH
            }
        }

        return undefined
    }

    public override async run(args: string) {
        const [ command ]: string[] = args.trim().split(/\s+/);
        if (!command) {
            stdout.write("You didn't enter a command\n")
            return;
        }

        const command_type = this.find_command_type(command);

        if ( command_type === undefined ) {
            stdout.write(`${command}: not found\n`);
            return;
        }

        switch (command_type) {
            case CommandType.BUILTIN:
                stdout.write(`${command} is a shell builtin\n`);
                break;
            default:
                stdout.write(`${command} is ${command_type}\n`);
                break;
        }

    }
}

export default Type;