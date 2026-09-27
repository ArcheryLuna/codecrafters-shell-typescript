import { createInterface, Interface } from "node:readline";
import { Handler } from "./handler";

class CodeCraftersCli {
    public rl: Interface;
    private handler: Handler;

    constructor () {
       this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "$ ",
       })

       this.handler = new Handler(this);
    }

    private async Handlers() {
        try {
            this.handler.load_events();
        } catch (exception) {
            console.error(`[ERROR]: ${exception}`);
        }
    }

    public StartCLI() {
        this.Handlers();

        this.rl.prompt();
    }

}

export { CodeCraftersCli }