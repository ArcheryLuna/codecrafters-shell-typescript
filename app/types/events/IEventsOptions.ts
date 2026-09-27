import { type InterfaceEventMap } from "node:readline";
import type { EventType } from "./EventTypeEnum";

export interface IEventsOptions {
    name: keyof InterfaceEventMap,
    description: string,
    type: EventType
}