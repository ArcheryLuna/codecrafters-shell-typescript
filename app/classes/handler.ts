import { glob } from "glob";
import type { CodeCraftersCli } from "./client";
import path from "node:path";
import { Event } from "./events";
import { EventType } from "@/types/events/EventTypeEnum";
import type { Commands } from "./commands";

class Handler {
    public client: CodeCraftersCli;

    constructor(client: CodeCraftersCli) {
        this.client = client;
    }

    public async load_events(): Promise<void> {
        const event_files = await glob(this.modulePattern('events'), {
            ignore: ['**/index.ts']
        });

        for( const file of event_files ) {
            const imported = await import(file);

            const EventConstructor = (imported as { default?: new (client: CodeCraftersCli) => Event}).default;

            if ( !EventConstructor ) {
                console.log(`[WARNING] The event ${file} is missing a default export.`);
                continue;
            }

            const event: Event = new EventConstructor(this.client);

            if (!event.name || !event.run || !event.type) {
                delete require.cache[file];
                console.log(`[WARNING] The event ${file} is missing a required property`);
                continue;
            }

            const run = (...args: any[]) => event.run(...args);

            switch (event.type) {
                case EventType.ONCE:
                    this.client.rl.once(event.name, run);
                    break;
                case EventType.ON:
                    this.client.rl.on(event.name, run);
                    break;
                case EventType.OFF:
                    this.client.rl.off(event.name, run);
                    break;
                default:
                    this.client.rl.on(event.name, run);
                    break;
            }

            delete require.cache[file];
            // console.log(`[SUCCESS] Loaded event ${event.name}`);
        }
    }

    public async load_commands(): Promise<void> {
        const CommandFiles = await glob(this.modulePattern('commands'), {
            ignore: ['**/index.ts']
        })

        for ( const File of CommandFiles ) {
            const imported = await import(File);

            const CommandConstructor = await (imported as { default?: new (client: CodeCraftersCli) => Commands}).default;

            if (!CommandConstructor) {
                console.log(`[WARNING] The command ${File} is missing a default export`);
                continue;
            }

            const command: Commands = new CommandConstructor(this.client);

            if (!command.name || !command.description || !command.type) {
                delete require.cache[File];
                console.log(`[WARNING] The command ${File} is missing a required property`);
                continue;
            }

            this.client.commands.set(command.name, command);
            // console.log(`[SUCCESS] Loaded command ${command.name}`);
        }
    }

    private modulePattern(directory: string): string {
        if (process.env.CLI_BUNDLED_ENTRYPOINTS === '1') {
            return path.join(path.dirname(process.argv[1]!), directory, '**/.js');
        }

        return path.join(__dirname, '..', directory, '**/*.{js,ts}');
    }
}

export { Handler }