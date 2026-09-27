import { type InterfaceEventMap } from "node:readline";
import { CodeCraftersCli } from "../../classes/client";
import type { EventType } from "./EventTypeEnum";

export interface IEvents {
    client: CodeCraftersCli, 
    name: keyof InterfaceEventMap,
    description: string,
    type: EventType

    run: (...args: any[]) => Promise<void>;
}