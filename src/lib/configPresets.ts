import { SiteConfig } from './siteConfig';

// Preset theme configurations
export const presetThemes: Record<string, SiteConfig> = {
    // Default green terminal
    default: {
        colors: {
            accent: '#00ff00',
            accentGlow: '#00ff0080',
            background: '#000000',
            foreground: '#ffffff',
            terminal: {
                background: '#000000',
                text: '#ffffff',
                success: '#00ff00',
                error: '#ff0000',
                system: '#00bfff',
                input: '#666666',
            },
        },
        typography: {
            fontFamily: 'monospace',
            fontSize: { base: '16px', terminal: '14px', heading: '48px' },
        },
        ui: {
            show3DBackground: true,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 40,
            borderRadius: '0px',
            glassEffect: false,
        },
        terminal: {
            prompt: 'admin@site-control:~$',
            promptRoot: 'root@site-control:~#',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.5,
        },
        text: {
            welcomeMessage: [
                'SYSTEM_INITIALIZED_SESSION',
                'Accessing high-level site control node...',
                "Type 'help' for full command list.",
            ],
            systemName: 'site-control',
            username: 'admin',
        },
        mode: 'view',
        scene: [],
    },

    // Cyberpunk neon theme
    cyberpunk: {
        colors: {
            accent: '#ff00ff',
            accentGlow: '#ff00ff80',
            background: '#0a0014',
            foreground: '#00ffff',
            terminal: {
                background: '#0a0014',
                text: '#00ffff',
                success: '#ff00ff',
                error: '#ff0055',
                system: '#00ff88',
                input: '#8800ff',
            },
        },
        typography: {
            fontFamily: '"Fira Code", monospace',
            fontSize: { base: '16px', terminal: '14px', heading: '52px' },
        },
        ui: {
            show3DBackground: true,
            showMatrixEffect: true,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 20,
            borderRadius: '12px',
            glassEffect: true,
        },
        terminal: {
            prompt: 'cyber@nexus:~$',
            promptRoot: 'root@nexus:~#',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.6,
        },
        text: {
            welcomeMessage: [
                '⚡ CYBERPUNK PROTOCOL ACTIVATED',
                'Neural link established...',
                'Welcome to the grid, runner.',
            ],
            systemName: 'nexus',
            username: 'cyber',
        },
        mode: 'view',
        scene: [],
    },

    // Classic hacker green on black
    hacker: {
        colors: {
            accent: '#00ff00',
            accentGlow: '#00ff0080',
            background: '#000000',
            foreground: '#00ff00',
            terminal: {
                background: '#000000',
                text: '#00ff00',
                success: '#00ff00',
                error: '#ff0000',
                system: '#00ff00',
                input: '#008800',
            },
        },
        typography: {
            fontFamily: '"Courier New", monospace',
            fontSize: { base: '14px', terminal: '13px', heading: '42px' },
        },
        ui: {
            show3DBackground: false,
            showMatrixEffect: true,
            showPipesEffect: false,
            showCmdButton: false,
            terminalOpacity: 100,
            borderRadius: '0px',
            glassEffect: false,
        },
        terminal: {
            prompt: 'root@mainframe:~#',
            promptRoot: 'root@mainframe:~#',
            cursorStyle: 'block',
            cursorBlink: false,
            fontSize: 13,
            lineHeight: 1.4,
        },
        text: {
            welcomeMessage: [
                'ACCESS GRANTED',
                'Mainframe connection established',
                'Type help for available commands',
            ],
            systemName: 'mainframe',
            username: 'root',
        },
        mode: 'view',
        scene: [],
    },

    // Minimal clean theme
    minimal: {
        colors: {
            accent: '#0066ff',
            accentGlow: '#0066ff40',
            background: '#ffffff',
            foreground: '#000000',
            terminal: {
                background: '#f5f5f5',
                text: '#333333',
                success: '#00aa00',
                error: '#cc0000',
                system: '#0066ff',
                input: '#999999',
            },
        },
        typography: {
            fontFamily: '"Inter", sans-serif',
            fontSize: { base: '16px', terminal: '14px', heading: '48px' },
        },
        ui: {
            show3DBackground: false,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 95,
            borderRadius: '16px',
            glassEffect: false,
        },
        terminal: {
            prompt: 'user@system:~$',
            promptRoot: 'root@system:~#',
            cursorStyle: 'line',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.6,
        },
        text: {
            welcomeMessage: [
                'Welcome',
                'System ready',
                'Type help to get started',
            ],
            systemName: 'system',
            username: 'user',
        },
        mode: 'view',
        scene: [],
    },

    // Nord theme
    nord: {
        colors: {
            accent: '#88c0d0',
            accentGlow: '#88c0d080',
            background: '#2e3440',
            foreground: '#d8dee9',
            terminal: {
                background: '#2e3440',
                text: '#d8dee9',
                success: '#a3be8c',
                error: '#bf616a',
                system: '#81a1c1',
                input: '#4c566a',
            },
        },
        typography: {
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: { base: '16px', terminal: '14px', heading: '48px' },
        },
        ui: {
            show3DBackground: true,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 90,
            borderRadius: '8px',
            glassEffect: true,
        },
        terminal: {
            prompt: 'nord@arctic:~$',
            promptRoot: 'root@arctic:~#',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.5,
        },
        text: {
            welcomeMessage: [
                'Nord Terminal v1.0',
                'Arctic theme loaded',
                'Ready for commands',
            ],
            systemName: 'arctic',
            username: 'nord',
        },
        mode: 'view',
        scene: [],
    },

    // Dracula theme
    dracula: {
        colors: {
            accent: '#ff79c6',
            accentGlow: '#ff79c680',
            background: '#282a36',
            foreground: '#f8f8f2',
            terminal: {
                background: '#282a36',
                text: '#f8f8f2',
                success: '#50fa7b',
                error: '#ff5555',
                system: '#8be9fd',
                input: '#6272a4',
            },
        },
        typography: {
            fontFamily: '"Fira Code", monospace',
            fontSize: { base: '16px', terminal: '14px', heading: '48px' },
        },
        ui: {
            show3DBackground: true,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 85,
            borderRadius: '10px',
            glassEffect: true,
        },
        terminal: {
            prompt: 'dracula@castle:~$',
            promptRoot: 'root@castle:~#',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.5,
        },
        text: {
            welcomeMessage: [
                '🧛 Dracula Terminal',
                'Dark theme activated',
                'Welcome to the night',
            ],
            systemName: 'castle',
            username: 'dracula',
        },
        mode: 'view',
        scene: [],
    },

    // Monokai theme
    monokai: {
        colors: {
            accent: '#a6e22e',
            accentGlow: '#a6e22e80',
            background: '#272822',
            foreground: '#f8f8f2',
            terminal: {
                background: '#272822',
                text: '#f8f8f2',
                success: '#a6e22e',
                error: '#f92672',
                system: '#66d9ef',
                input: '#75715e',
            },
        },
        typography: {
            fontFamily: '"Monaco", monospace',
            fontSize: { base: '16px', terminal: '14px', heading: '48px' },
        },
        ui: {
            show3DBackground: true,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: true,
            terminalOpacity: 90,
            borderRadius: '6px',
            glassEffect: false,
        },
        terminal: {
            prompt: 'monokai@dev:~$',
            promptRoot: 'root@dev:~#',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 14,
            lineHeight: 1.5,
        },
        text: {
            welcomeMessage: [
                'Monokai Terminal',
                'Developer environment ready',
                'Type help for commands',
            ],
            systemName: 'dev',
            username: 'monokai',
        },
        mode: 'view',
        scene: [],
    },

    // Retro amber terminal
    retro: {
        colors: {
            accent: '#ffb000',
            accentGlow: '#ffb00080',
            background: '#000000',
            foreground: '#ffb000',
            terminal: {
                background: '#000000',
                text: '#ffb000',
                success: '#ffb000',
                error: '#ff0000',
                system: '#ffb000',
                input: '#aa7700',
            },
        },
        typography: {
            fontFamily: '"VT323", monospace',
            fontSize: { base: '18px', terminal: '16px', heading: '52px' },
        },
        ui: {
            show3DBackground: false,
            showMatrixEffect: false,
            showPipesEffect: false,
            showCmdButton: false,
            terminalOpacity: 100,
            borderRadius: '0px',
            glassEffect: false,
        },
        terminal: {
            prompt: 'C:\\>',
            promptRoot: 'C:\\>',
            cursorStyle: 'block',
            cursorBlink: true,
            fontSize: 16,
            lineHeight: 1.3,
        },
        text: {
            welcomeMessage: [
                'MS-DOS Version 6.22',
                '(C) Copyright Microsoft Corp 1981-1994',
                'Type HELP for assistance',
            ],
            systemName: 'dos',
            username: 'user',
        },
        mode: 'view',
        scene: [],
    },
};

// Get list of available theme names
export function getThemeNames(): string[] {
    return Object.keys(presetThemes);
}

// Get theme by name
export function getTheme(name: string): SiteConfig | null {
    return presetThemes[name.toLowerCase()] || null;
}
