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

describe("double-quoted command arguments", () => {
    test("preserves spaces and tabs", () => {
        expect(values('echo "hello    world\ttest"')).toEqual([
            "echo", "hello    world\ttest",
        ]);
    });

    test("concatenates adjacent fragments but separates unquoted whitespace", () => {
        expect(values('echo "hello""world" "hello"world "hello" "world"')).toEqual([
            "echo", "helloworld", "helloworld", "hello", "world",
        ]);
    });

    test("treats the other quote character literally and joins mixed fragments", () => {
        expect(values(`echo "shell's test" 'say "hello"' pre"middle"'end'`)).toEqual([
            "echo", "shell's test", 'say "hello"', "premiddleend",
        ]);
    });

    test("preserves empty arguments and leaves expansion and escapes for later stages", () => {
        expect(values(String.raw`echo "" ""x "a $HOME * ~ \ b"`)).toEqual([
            "echo", "", "x", String.raw`a $HOME * ~ \ b`,
        ]);
        expect(parseCommand('"~" "~/app"')).toEqual([
            { value: "~", expandTilde: false },
            { value: "~/app", expandTilde: false },
        ]);
    });

    test("rejects unclosed double quotes", () => {
        expect(() => parseCommand('echo "unfinished')).toThrow("unterminated double quote");
    });
});
