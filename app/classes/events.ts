import type { IEvents } from "@/types/events/IEvents";
import type { IEventsOptions } from "@/types/events/IEventsOptions";
import { CodeCraftersCli as Client } from "@/classes/client";
import { EventType } from "@/types/events/EventTypeEnum";
import { type InterfaceEventMap } from "node:readline";


class Event implements IEvents {
    client: Client;
    name: keyof InterfaceEventMap;
    description: string;
    type: EventType;

    constructor(
        client: Client,
        options: IEventsOptions
    ) {
        this.client = client;
        this.name = options.name,
        this.description = options.description;
        this.type = options.type;
    }

    public async run(...args: any[]): Promise<void> {
        throw new Error('Method not implemented.');
    }
}

export { Event }