import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { stdout } from "node:process";

class Echo extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'echo',
            description: 'copy\'s the users message to the standard output',
            type: CommandType.BUILTIN,
        })
    }

    public override async run(text: string, args: string[]) {
       stdout.write(`${text}\n`) 
    }
}

export default Echo;