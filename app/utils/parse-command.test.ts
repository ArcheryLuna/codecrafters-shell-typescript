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

    test("preserves empty arguments, literal backslash-space, and unexpanded variables", () => {
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


describe("backslash escaping outside quotes", () => {
    test("preserves escaped whitespace and splits unescaped whitespace", () => {
        expect(values(String.raw`echo three\ \ \ spaces before\     after`)).toEqual([
            "echo", "three   spaces", "before ", "after",
        ]);
        expect(values("echo a\\\tb")).toEqual(["echo", "a\tb"]);
    });

    test("escapes ordinary characters without interpreting control sequences", () => {
        expect(values(String.raw`echo test\nexample ignore\_backslash \t`)).toEqual([
            "echo", "testnexample", "ignore_backslash", "t",
        ]);
    });

    test("keeps escaped quotes and special characters literal", () => {
        expect(values(String.raw`echo \'\"literal quotes\"\' hello\\world \$\*\?`)).toEqual([
            "echo", `'"literal`, `quotes"'`, String.raw`hello\world`, "$*?",
        ]);
        expect(parseCommand(String.raw`\~`)).toEqual([
            { value: "~", expandTilde: false },
        ]);
    });

    test("combines escaped characters with quoted fragments", () => {
        expect(values(String.raw`echo pre\ "middle"'end'`)).toEqual([
            "echo", "pre middleend",
        ]);
    });

    test("keeps backslashes before ordinary characters inside quotes", () => {
        expect(values(String.raw`echo 'a\ b' "c\ d"`)).toEqual([
            "echo", String.raw`a\ b`, String.raw`c\ d`,
        ]);
    });

    test("rejects a trailing escape instead of executing a partial command", () => {
        expect(() => parseCommand("echo unfinished\\")).toThrow("unfinished escape");
    });
});


describe("backslashes in double quotes", () => {
    test("escapes double quotes and backslashes", () => {
        expect(values(String.raw`echo "A \\ escapes itself" "A \" inside double quotes"`)).toEqual([
            "echo", String.raw`A \ escapes itself`, 'A " inside double quotes',
        ]);
    });

    test("handles the stage examples and concatenates following fragments", () => {
        expect(values(String.raw`echo "just'one'\\n'backslash"`)).toEqual([
            "echo", String.raw`just'one'\n'backslash`,
        ]);
        expect(values(String.raw`echo "inside\"literal_quote."outside\"`)).toEqual([
            "echo", 'inside"literal_quote.outside"',
        ]);
    });

    test("retains backslashes before ordinary characters in double quotes", () => {
        expect(values(String.raw`echo "\n \t \_ \ '"`)).toEqual([
            "echo", String.raw`\n \t \_ \ '`,
        ]);
    });

    test("leaves all backslashes literal in single quotes", () => {
        expect(values(String.raw`echo '\\ \"'`)).toEqual([
            "echo", String.raw`\\ \"`,
        ]);
    });

    test("parses escaped filename characters", () => {
        expect(values(String.raw`cat /tmp/"number 1" /tmp/"doublequote \" 2" /tmp/"backslash \\ 3"`)).toEqual([
            "cat", "/tmp/number 1", '/tmp/doublequote " 2', String.raw`/tmp/backslash \ 3`,
        ]);
    });

    test("distinguishes escaped closing quotes from escaped backslashes", () => {
        expect(() => parseCommand(String.raw`echo "unfinished\"`)).toThrow("unterminated double quote");
        expect(values(String.raw`echo "ends\\" next`)).toEqual([
            "echo", "ends\\", "next",
        ]);
    });
});
