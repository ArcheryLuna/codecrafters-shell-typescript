import { createInterface, Interface } from "node:readline";
import { Handler } from "./handler";
import type { Commands } from "./commands";
import { statSync } from "node:fs";
import { isAbsolute } from "node:path";

class CodeCraftersCli {
    public rl: Interface;
    private handler: Handler;
    public logicalCwd: string;

    public commands: Map<string, Commands>;
    constructor () {
       this.rl = createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "$ ",
       })

       this.commands = new Map<string, Commands>();

       this.handler = new Handler(this);
       this.logicalCwd = process.cwd();

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

    private GetLogicalCwd() {
       const inheritedPwd = process.env.PWD;

       if (
        inheritedPwd && 
        isAbsolute(inheritedPwd) && 
        !inheritedPwd.split("/").some(
            part => part === "." || part === ".."
        )) {
            try {
                const inherited = statSync(inheritedPwd);
                const current = statSync(".")

                // same device and inode means same dir
                if (
                    inherited.dev === current.dev &&
                    inherited.ino === current.ino
                ) {
                    this.logicalCwd = inheritedPwd;
                }
            } catch {
                // PWD is inaccessible or invalid;
                // Keep the physical path.
            }
        }
    }

    public StartCLI() {
        const validation: boolean = this.Handlers();

        this.GetLogicalCwd()

        if (validation) {
            this.rl.prompt()
        } else {
            console.error(`[ERROR] Starting the handlers failed`)
        }
    }

}

export { CodeCraftersCli }