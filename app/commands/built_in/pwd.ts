import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { stderr, stdout } from "node:process";

class PrintWorkingDirectory extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'pwd',
            description: 'Put the current directory into the standard output.',
            type: CommandType.BUILTIN,
        })
    }

    public override async run(text: string, args: string[]): Promise<void> {
        let physical = false;

        for (const arg of args) {
            if (arg === "-L") 
                physical = false;
            else if (arg === "-P")
                physical = true;
            else {
                stderr.write(`pwd: invalid argument: ${arg}\n`);
                return;
            }
        }

        const directory = physical ?
            process.cwd()
            : this.client.logicalCwd;

        stdout.write(`${directory}\n`)
    }
}

export default PrintWorkingDirectory;