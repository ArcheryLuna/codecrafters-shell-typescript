export interface ShellWord {
    value: string;
    expandTilde: boolean;
}

export function parseCommand(input: string): ShellWord[] {
    const words: ShellWord[] = [];
    let value = "";
    let source = "";
    let started = false;
    let quote: "'" | '"' | undefined;

    const finishWord = () => {
        if (!started) return;
        words.push({ value, expandTilde: /^~(?:\/|$)/.test(source) });
        value = "";
        source = "";
        started = false;
    };

    for (const character of input) {
        if (quote !== undefined) {
            source += character;
            if (character === quote) {
                quote = undefined;
            } else {
                value += character;
            }
        } else if (character === "'" || character === '"') {
            quote = character;
            started = true;
            source += character;
        } else if (/\s/.test(character)) {
            finishWord();
        } else {
            started = true;
            value += character;
            source += character;
        }
    }

    if (quote !== undefined) {
        const kind = quote === "'" ? "single" : "double";
        throw new Error(`unterminated ${kind} quote`);
    }
    finishWord();
    return words;
}
