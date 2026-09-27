import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { stdout } from "node:process";

class Type extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'type',
            description: 'Tells you the type of command that this is.',
            type: CommandType.BUILTIN,
        })
    }

    private find_command_type(input: string): CommandType | undefined {
        const get_command: Commands | undefined = this.client.commands.get(input);

        if ( get_command === undefined ) {
            return undefined;
        }

        return get_command.type;
    }

    public override async run(args: string) {
        const [ command, ...rest ]: string[] = args.trim().split(/\s+/);
        const text = rest.join(" ");

        const command_type = this.find_command_type(command.toLowerCase());

        if ( command_type === undefined ) {
            stdout.write(`${command}: not found\n`);
            return;
        }

        switch (command_type) {
            case CommandType.BUILTIN:
                stdout.write(`${command} is a shell builtin\n`);
                break;
            default:
                stdout.write(`No type was found for ${command}`);
        }

    }
}

export default Type;