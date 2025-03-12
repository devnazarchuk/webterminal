// Site Configuration Store
export interface SceneObject {
    id: string;
    type: 'cube' | 'sphere' | 'plane';
    position: [number, number, number];
    rotation: [number, number, number];
    scale: [number, number, number];
    color: string;
}

// Site Configuration Store
export interface SiteConfig {
    mode: 'view' | 'edit';
    scene: SceneObject[];
    // Colors
    colors: {
        accent: string;
        accentGlow: string;
        background: string;
        foreground: string;
        terminal: {
            background: string;
            text: string;
            success: string;
            error: string;
            system: string;
            input: string;
        };
    };

    // Typography
    typography: {
        fontFamily: string;
        fontSize: {
            base: string;
            terminal: string;
            heading: string;
        };
    };

    // UI Elements
    ui: {
        show3DBackground: boolean;
        showMatrixEffect: boolean;
        showPipesEffect: boolean;
        showCmdButton: boolean;
        terminalOpacity: number;
        borderRadius: string;
        glassEffect: boolean;
    };

    // Terminal Settings
    terminal: {
        prompt: string;
        promptRoot: string;
        cursorStyle: 'block' | 'line' | 'underline';
        cursorBlink: boolean;
        fontSize: number;
        lineHeight: number;
    };

    // Custom Text
    text: {
        welcomeMessage: string[];
        systemName: string;
        username: string;
    };
}

// Default configuration
export const defaultConfig: SiteConfig = {
    mode: 'view',
    scene: [],
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
        fontSize: {
            base: '16px',
            terminal: '14px',
            heading: '48px',
        },
    },
    ui: {
        show3DBackground: true,
        showMatrixEffect: true,
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
};

// Configuration utilities
export class ConfigManager {
    private static readonly STORAGE_KEY = 'site-config';
    private static readonly SAVED_CONFIGS_KEY = 'saved-configs';

    // Get current config from localStorage or return default
    static getConfig(): SiteConfig {
        if (typeof window === 'undefined') return defaultConfig;

        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                return this.mergeWithDefaults(parsed);
            }
        } catch (error) {
            console.error('Failed to load config:', error);
        }
        return defaultConfig;
    }

    // Save config to localStorage
    static saveConfig(config: SiteConfig): void {
        if (typeof window === 'undefined') return;

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
        } catch (error) {
            console.error('Failed to save config:', error);
        }
    }

    // Merge partial config with defaults
    static mergeWithDefaults(partial: Partial<SiteConfig>): SiteConfig {
        return {
            mode: partial.mode || defaultConfig.mode,
            scene: partial.scene || defaultConfig.scene,
            colors: { ...defaultConfig.colors, ...partial.colors },
            typography: { ...defaultConfig.typography, ...partial.typography },
            ui: { ...defaultConfig.ui, ...partial.ui },
            terminal: { ...defaultConfig.terminal, ...partial.terminal },
            text: { ...defaultConfig.text, ...partial.text },
        };
    }

    // Apply config to document
    static applyConfig(config: SiteConfig): void {
        if (typeof document === 'undefined') return;

        const root = document.documentElement;

        // Apply colors
        root.style.setProperty('--accent', config.colors.accent);
        root.style.setProperty('--accent-glow', config.colors.accentGlow);
        root.style.setProperty('--background', config.colors.background);
        root.style.setProperty('--foreground', config.colors.foreground);

        // Apply typography
        root.style.setProperty('--font-family', config.typography.fontFamily);
        root.style.setProperty('--font-size-base', config.typography.fontSize.base);
        root.style.setProperty('--font-size-terminal', config.typography.fontSize.terminal);
        root.style.setProperty('--font-size-heading', config.typography.fontSize.heading);

        // Apply UI
        root.style.setProperty('--border-radius', config.ui.borderRadius);
    }

    // Reset to defaults
    static resetConfig(): void {
        this.saveConfig(defaultConfig);
        this.applyConfig(defaultConfig);
    }

    // Export config as JSON string
    static exportConfig(config: SiteConfig): string {
        return JSON.stringify(config, null, 2);
    }

    // Import config from JSON string
    static importConfig(jsonString: string): SiteConfig | null {
        try {
            const parsed = JSON.parse(jsonString);
            return this.mergeWithDefaults(parsed);
        } catch (error) {
            console.error('Failed to import config:', error);
            return null;
        }
    }

    // Save named config
    static saveNamedConfig(name: string, config: SiteConfig): void {
        if (typeof window === 'undefined') return;

        try {
            const saved = this.getSavedConfigs();
            saved[name] = config;
            localStorage.setItem(this.SAVED_CONFIGS_KEY, JSON.stringify(saved));
        } catch (error) {
            console.error('Failed to save named config:', error);
        }
    }

    // Load named config
    static loadNamedConfig(name: string): SiteConfig | null {
        if (typeof window === 'undefined') return null;

        try {
            const saved = this.getSavedConfigs();
            return saved[name] || null;
        } catch (error) {
            console.error('Failed to load named config:', error);
            return null;
        }
    }

    // Get all saved configs
    static getSavedConfigs(): Record<string, SiteConfig> {
        if (typeof window === 'undefined') return {};

        try {
            const stored = localStorage.getItem(this.SAVED_CONFIGS_KEY);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to get saved configs:', error);
            return {};
        }
    }

    // Delete named config
    static deleteNamedConfig(name: string): void {
        if (typeof window === 'undefined') return;

        try {
            const saved = this.getSavedConfigs();
            delete saved[name];
            localStorage.setItem(this.SAVED_CONFIGS_KEY, JSON.stringify(saved));
        } catch (error) {
            console.error('Failed to delete named config:', error);
        }
    }

    // Copy to clipboard
    static async copyToClipboard(config: SiteConfig): Promise<boolean> {
        try {
            await navigator.clipboard.writeText(this.exportConfig(config));
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    // Download as file
    static downloadConfig(config: SiteConfig, filename: string = 'site-config.json'): void {
        const blob = new Blob([this.exportConfig(config)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Helper to set nested property by path
export function setNestedProperty(obj: any, path: string, value: any): void {
    const keys = path.split('.');
    let current = obj;

    for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
            current[keys[i]] = {};
        }
        current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
}

// Helper to get nested property by path
export function getNestedProperty(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}
