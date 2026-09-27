import { Event } from "@/classes/events";
import { CodeCraftersCli as Client } from "@/classes/client";
import { EventType } from "@/types/events/EventTypeEnum";

class Line extends Event {

    constructor ( client: Client ) {
        super(client, {
            name: 'line',
            description: 'Reads the STDIN input and find the command.',
            type: EventType.ON
        })
    }

    public override async run(command: string): Promise<void> {
        console.log(`${command}: command not found`);
    }
}

export default Line;