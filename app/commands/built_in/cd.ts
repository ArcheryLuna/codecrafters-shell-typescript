import { CodeCraftersCli as Client } from "@/classes/client";
import { Commands } from "@/classes/commands";
import { CommandType } from "@/types/commands/CommandTypeEnum";
import { stderr, stdout } from "node:process";
import path from "node:path";
import { homedir } from "node:os";

class ChangeDir extends Commands {
    constructor(client: Client) {
        super(client, {
            name: "cd",
            description: "Change the current working directory",
            type: CommandType.BUILTIN,
        });
    }

    public override async run(_text: string, args: string[], expandTilde: boolean[] = []): Promise<void> {
        let physical = false;
        let index = 0;

        for (; index < args.length; index++) {
            const arg = args[index]!;
            if (arg === "--") {
                index++;
                break;
            }
            if (arg === "-" || !arg.startsWith("-")) break;
            if (!/^-[LP]+$/.test(arg)) {
                stderr.write(`cd: invalid option: ${arg}\n`);
                return;
            }
            // When options conflict, the last option wins.
            physical = arg.endsWith("P");
        }

        if (args.length - index > 1) {
            stderr.write("cd: too many arguments\n");
            return;
        }

        const input = args[index] ?? "~";
        const previous = this.client.logicalCwd;
        const printDirectory = input === "-";
        let expanded: string;

        if (printDirectory) {
            if (!process.env.OLDPWD) {
                stderr.write("cd: OLDPWD not set\n");
                return;
            }
            expanded = process.env.OLDPWD;
        } else {
            const allowExpansion = expandTilde[index] !== false;
            expanded = allowExpansion && input === "~" ? homedir()
                : allowExpansion && input.startsWith("~/") ? `${homedir()}/${input.slice(2)}`
                : input;
        }

        if (expanded === "") {
            stderr.write("cd: : No such file or directory\n");
            return;
        }

        // Physical mode leaves symlinks and '..' for the OS to traverse in order.
        // Logical mode resolves '..' against the path shown by pwd -L.
        const target = physical ? expanded : path.resolve(previous, expanded);

        try {
            process.chdir(target);
        } catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            const message = code === "ENOENT" ? "No such file or directory"
                : code === "ENOTDIR" ? "Not a directory"
                : code === "EACCES" || code === "EPERM" ? "Permission denied"
                : code === "ELOOP" ? "Too many levels of symbolic links"
                : code === "ENAMETOOLONG" ? "File name too long"
                : error instanceof Error ? error.message : "Unable to change directory";
            stderr.write(`cd: ${input}: ${message}\n`);
            return;
        }

        this.client.logicalCwd = physical ? process.cwd() : target;
        process.env.OLDPWD = previous;
        process.env.PWD = this.client.logicalCwd;

        if (printDirectory) stdout.write(`${this.client.logicalCwd}\n`);
    }
}

export default ChangeDir;
