import { TerminalLine } from './linuxCommands';

export class FunCommands {
    static handleCowsay(args: string[]): TerminalLine[] {
        const text = args.join(' ') || "Moo!";
        const len = text.length;
        const top = '_' + '_'.repeat(len + 2) + '_';
        const bottom = '-' + '-'.repeat(len + 2) + '-';

        return [
            { text: top, type: 'output' },
            { text: `< ${text} >`, type: 'output' },
            { text: bottom, type: 'output' },
            { text: "        \\   ^__^", type: 'output' },
            { text: "         \\  (oo)\\_______", type: 'output' },
            { text: "            (__)\\       )\\/\\", type: 'output' },
            { text: "                ||----w |", type: 'output' },
            { text: "                ||     ||", type: 'output' },
        ];
    }

    static handleFortune(): TerminalLine[] {
        const fortunes = [
            "A computer once beat me at chess, but it was no match for me at kick boxing.",
            "As far as we know, our computer has never had an undetected error.",
            "Computers make very fast, very accurate mistakes.",
            "I have not failed. I've just found 10,000 ways that won't work.",
            "The best way to predict the future is to invent it.",
            "Real programmers don't comment their code. If it was hard to write, it should be hard to understand.",
            "Software is like sex: it's better when it's free.",
            "There are 10 types of people in the world: those who understand binary, and those who don't.",
            "Unix is the answer, but only if you phrase the question correctly.",
            "Your limitation—it's only your imagination.",
        ];
        const random = fortunes[Math.floor(Math.random() * fortunes.length)];
        return [{ text: random, type: 'success' }];
    }

    static handleSl(): TerminalLine[] {
        // Simple Steam Locomotive ASCII art
        // Animation is hard in static lines, but we can return one frame 
        // OR better: we can return a sequence that the terminal "animates" 
        // by checking line type. But our terminal is static list.
        // We can simulate animation by adding lines?
        // Let's just return a static train for now, or maybe the user wants real animation.
        // Real animation in React state requires `ProcessCommand` to start an interval.
        // We can return a special signal or just static art.
        // Let's try static first.

        return [
            { text: " .....====.........________..............._________ ......", type: 'output' },
            { text: "  _D _|  |_ ______|_  ____|_  ____  ______|_  ____|_  ____", type: 'output' },
            { text: " |   _  _  _ [____]  ]  ]  ]  ]  ]  ]  ]  ]  ]  ]  ]  ]  ]", type: 'output' },
            { text: " |__| |_| |_|_________|____|____|____|____|____|____|____|", type: 'output' },
            { text: "  ...@--@--@.....@--@--@.....@--@--@.....@--@--@.....@--@ ", type: 'output' },
        ];
    }

    static handleFiglet(args: string[]): TerminalLine[] {
        const text = (args.join(' ') || "HELLO").toUpperCase();
        // Very basic 3x5 font mapping for demo
        const font: Record<string, string[]> = {
            'A': ["  A  ", " A A ", "AAAAA", "A   A", "A   A"],
            'B': ["BBBB ", "B   B", "BBBB ", "B   B", "BBBB "],
            'C': [" CCCC", "C    ", "C    ", "C    ", " CCCC"],
            'D': ["DDDD ", "D   D", "D   D", "D   D", "DDDD "],
            'E': ["EEEEE", "E    ", "EEEEE", "E    ", "EEEEE"],
            'H': ["H   H", "H   H", "HHHHH", "H   H", "H   H"],
            'I': ["IIIII", "  I  ", "  I  ", "  I  ", "IIIII"],
            'L': ["L    ", "L    ", "L    ", "L    ", "LLLLL"],
            'O': [" OOO ", "O   O", "O   O", "O   O", " OOO "],
            'R': ["RRRR ", "R   R", "RRRR ", "R  R ", "R   R"],
            'T': ["TTTTT", "  T  ", "  T  ", "  T  ", "  T  "],
            'X': ["X   X", " X X ", "  X  ", " X X ", "X   X"],
            ' ': ["     ", "     ", "     ", "     ", "     "],
        };

        const resultLines = ["", "", "", "", ""];

        for (const char of text) {
            const art = font[char] || font['X']; // Fallback
            for (let i = 0; i < 5; i++) {
                resultLines[i] += " " + (art ? art[i] : "?????");
            }
        }

        return resultLines.map(line => ({ text: line, type: 'output' }));
    }
}
