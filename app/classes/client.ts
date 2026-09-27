import { createInterface, Interface } from "node:readline";
import { Handler } from "./handler";
import type { Commands } from "./commands";

class CodeCraftersCli {
    public rl: Interface;
    private handler: Handler;

    public commands: Map<string, Commands>;
    constructor () {
       this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "$ ",
       })

       this.commands = new Map<string, Commands>();

       this.handler = new Handler(this);
    }

    private Handlers(): boolean {
        try {
            this.handler.load_events();
            this.handler.load_commands();
        } catch (exception) {
            console.error(`[ERROR]: ${exception}`);

            return false
        }

        return true;

    }

    public StartCLI() {
        const validation: boolean = this.Handlers();

        if (validation) {
            this.rl.prompt()
        } else {
            console.error(`[ERROR] Starting the handlers failed`)
        }
    }

}

export { CodeCraftersCli }