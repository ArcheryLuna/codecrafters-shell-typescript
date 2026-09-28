import { Event } from "@/classes/events";
import { CodeCraftersCli as Client } from "@/classes/client";
import { EventType } from "@/types/events/EventTypeEnum";
import { stderr, stdout } from "node:process";
import type { Commands } from "@/classes/commands";
import path from "node:path";
import { accessSync, constants, statSync } from "node:fs";
import { spawnSync } from "node:child_process";

class Line extends Event {

    constructor ( client: Client ) {
        super(client, {
            name: 'line',
            description: 'Reads the STDIN input and find the command.',
            type: EventType.ON
        })
    }

    // This will return an Object, a path for a non built in command
    // Or undefined.
    private commands(input: string): Commands | string | undefined {
        const builtin = this.get_builtin_commands(input);

        if ( builtin !== undefined) return builtin;

        return this.get_command_path(input);
    }

    private get_builtin_commands(input: string): Commands | undefined {
        return this.client.commands.get(input);
    }

    private get_command_path(input: string): string | undefined {
        const ENV_PATH: string[] = process.env.PATH?.split(path.delimiter) ?? [];

        for (const dir of ENV_PATH) {
            const fullPath = path.join(dir, input);

            try {
               accessSync(fullPath, constants.X_OK);

               // Make sure what you found is a file.
               if (statSync(fullPath).isFile()) return fullPath 
            } catch {
                // NORMAL: Continue operations.
            }
        }

        return undefined;
    }

    public override async run(input: string): Promise<void> {
        const [commandName, ...args]: string[] = input.trim().split(/\s+/);
        
        if (!commandName) {
            stdout.write(`${commandName}: command not found\n`)
            stdout.write("$ ");
            return;
        }

        const text = args.join(" ");
        const command = this.commands(commandName);

        switch (typeof command) {
            case "undefined":
                stdout.write(`${commandName}: command not found\n`);
                break;
            case "string":
                const result = spawnSync(command, args, {
                    argv0: commandName,
                    stdio: "inherit"
                })

                if (result.error) {
                    stderr.write(`${commandName}: ${result.error.message}\n`);
                }
                break;
            case "object":
                await command.run(text, args);
                break;
            default:
                stdout.write(`${commandName}: command not found`);
        }

        this.client.rl.prompt();

    }
}

export default Line;