import { describe, expect, test } from "bun:test";
import { parseCommand } from "./parse-command";

const values = (input: string) => parseCommand(input).map(word => word.value);

describe("single-quoted command arguments", () => {
    test("preserves quoted spaces and tabs while splitting unquoted whitespace", () => {
        expect(values("  echo\t'hello    world\ttest'   next ")).toEqual([
            "echo", "hello    world\ttest", "next",
        ]);
    });

    test("concatenates adjacent quoted and unquoted fragments", () => {
        expect(values("echo 'hello''world' hello''world pre' middle 'post")).toEqual([
            "echo", "helloworld", "helloworld", "pre middle post",
        ]);
    });

    test("keeps empty arguments and literal special characters", () => {
        expect(values(String.raw`echo '' '$HOME * ~ \ "'`)).toEqual([
            "echo", "", String.raw`$HOME * ~ \ "`,
        ]);
    });

    test("distinguishes quoted tildes from home shorthand", () => {
        expect(parseCommand("~ ~/app '~' '~/'app")).toEqual([
            { value: "~", expandTilde: true },
            { value: "~/app", expandTilde: true },
            { value: "~", expandTilde: false },
            { value: "~/app", expandTilde: false },
        ]);
    });

    test("handles blank lines and rejects unclosed quotes", () => {
        expect(values(" \t ")).toEqual([]);
        expect(() => parseCommand("echo 'unfinished")).toThrow("unterminated single quote");
    });
});
