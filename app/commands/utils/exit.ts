import { CodeCraftersCli as Client} from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { exit, stdout } from "node:process";

class Exit extends Commands {
    constructor ( client: Client ) {
        super(client, {
            name: 'exit',
            description: 'Terminates the program',
            type: CommandType.UTIL,
        })
    }

    public override async run(command: string) {
        exit();
    }
}

export default Exit;