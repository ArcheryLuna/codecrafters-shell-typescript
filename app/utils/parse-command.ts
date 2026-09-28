export interface ShellWord {
    value: string;
    expandTilde: boolean;
}

export function parseCommand(input: string): ShellWord[] {
    const words: ShellWord[] = [];
    let value = "";
    let source = "";
    let started = false;
    let quoted = false;

    const finishWord = () => {
        if (!started) return;
        words.push({ value, expandTilde: /^~(?:\/|$)/.test(source) });
        value = "";
        source = "";
        started = false;
    };

    for (const character of input) {
        if (character === "'") {
            quoted = !quoted;
            started = true;
            source += character;
        } else if (!quoted && /\s/.test(character)) {
            finishWord();
        } else {
            started = true;
            value += character;
            source += character;
        }
    }

    if (quoted) throw new Error("unterminated single quote");
    finishWord();
    return words;
}
