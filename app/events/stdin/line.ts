import { Event } from "@/classes/events";
import { CodeCraftersCli as Client } from "@/classes/client";
import { EventType } from "@/types/events/EventTypeEnum";
import { stdout } from "node:process";
import type { Commands } from "@/classes/commands";

class Line extends Event {

    constructor ( client: Client ) {
        super(client, {
            name: 'line',
            description: 'Reads the STDIN input and find the command.',
            type: EventType.ON
        })
    }

    private get_command(input: string): Commands | null {
        const Command: Commands | undefined = this.client.commands.get(input);

        if (!Command) {
            return null;
        }

        return Command;
    }

    public override async run(input: string): Promise<void> {
        const [command, ...rest]: string[] = input.trim().split(/\s+/);
        const text: string = rest.join(" ");
        
        // Get the command out of the hashmap
        const CliCommand = this.get_command(command);

        if (CliCommand === null) {
            stdout.write(`${command}: command not found \n`)
            stdout.write('$ ')
            return;
        } 

        CliCommand.run(text);

        stdout.write('$ ');
    }
}

export default Line;