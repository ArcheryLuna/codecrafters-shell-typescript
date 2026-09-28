import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { exit, stdout } from "node:process";

class Exit extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'exit',
            description: 'Terminates the program',
            type: CommandType.BUILTIN,
        })
    }

    public override async run(text: string, args: string[]) {
        this.client.rl.close();         
    }
}

export default Exit;