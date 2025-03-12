// Customization command handlers for FullTerminal
import { SiteConfig, setNestedProperty, getNestedProperty } from './siteConfig';
import { getThemeNames } from './configPresets';

export interface TerminalLine {
    text: string;
    type: 'input' | 'output' | 'error' | 'success' | 'system';
}

export class CustomizationCommands {
    // Color commands
    static handleColorCommand(
        args: string[],
        config: SiteConfig,
        updateConfig: (updates: Partial<SiteConfig>) => void
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0 || args[0] === 'list') {
            output.push({ text: '=== Current Colors ===', type: 'success' });
            output.push({ text: `Accent: ${config.colors.accent}`, type: 'output' });
            output.push({ text: `Background: ${config.colors.background}`, type: 'output' });
            output.push({ text: `Foreground: ${config.colors.foreground}`, type: 'output' });
            output.push({ text: `Terminal BG: ${config.colors.terminal.background}`, type: 'output' });
            output.push({ text: `Terminal Text: ${config.colors.terminal.text}`, type: 'output' });
            output.push({ text: `Success: ${config.colors.terminal.success}`, type: 'output' });
            output.push({ text: `Error: ${config.colors.terminal.error}`, type: 'output' });
            output.push({ text: `System: ${config.colors.terminal.system}`, type: 'output' });
            return output;
        }

        if (args[0] === 'set' && args.length >= 3) {
            const property = args[1];
            const value = args[2];

            // Validate hex color
            if (!/^#[0-9A-Fa-f]{6}$/.test(value)) {
                output.push({ text: 'Error: Invalid hex color format. Use #RRGGBB', type: 'error' });
                return output;
            }

            const colorMap: Record<string, string> = {
                'accent': 'colors.accent',
                'background': 'colors.background',
                'bg': 'colors.background',
                'foreground': 'colors.foreground',
                'fg': 'colors.foreground',
                'terminal.bg': 'colors.terminal.background',
                'terminal.text': 'colors.terminal.text',
                'terminal.success': 'colors.terminal.success',
                'terminal.error': 'colors.terminal.error',
                'terminal.system': 'colors.terminal.system',
            };

            const path = colorMap[property];
            if (!path) {
                output.push({ text: `Error: Unknown color property '${property}'`, type: 'error' });
                output.push({ text: 'Available: accent, background, foreground, terminal.bg, terminal.text, terminal.success, terminal.error, terminal.system', type: 'output' });
                return output;
            }

            const newConfig = { ...config };
            setNestedProperty(newConfig, path, value);

            // Also update glow color for accent
            if (property === 'accent') {
                newConfig.colors.accentGlow = value + '80';
            }

            updateConfig(newConfig);
            output.push({ text: `✓ ${property} set to ${value}`, type: 'success' });
            return output;
        }

        if (args[0] === 'random') {
            const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            const accent = randomColor();
            updateConfig({
                colors: {
                    ...config.colors,
                    accent,
                    accentGlow: accent + '80',
                },
            });
            output.push({ text: `✓ Random accent color: ${accent}`, type: 'success' });
            return output;
        }

        output.push({ text: 'Usage: color [list|set <property> <hex>|random]', type: 'output' });
        return output;
    }

    // UI commands
    static handleUICommand(
        args: string[],
        config: SiteConfig,
        updateConfig: (updates: Partial<SiteConfig>) => void
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0) {
            output.push({ text: '=== Current UI Settings ===', type: 'success' });
            output.push({ text: `3D Background: ${config.ui.show3DBackground ? 'ON' : 'OFF'}`, type: 'output' });
            output.push({ text: `Matrix Effect: ${config.ui.showMatrixEffect ? 'ON' : 'OFF'}`, type: 'output' });
            output.push({ text: `CMD Button: ${config.ui.showCmdButton ? 'ON' : 'OFF'}`, type: 'output' });
            output.push({ text: `Terminal Opacity: ${config.ui.terminalOpacity}%`, type: 'output' });
            output.push({ text: `Border Radius: ${config.ui.borderRadius}`, type: 'output' });
            output.push({ text: `Glass Effect: ${config.ui.glassEffect ? 'ON' : 'OFF'}`, type: 'output' });
            return output;
        }

        if (args[0] === 'show' && args.length >= 2) {
            const element = args[1];
            const updates: Partial<SiteConfig> = { ui: { ...config.ui } };

            switch (element) {
                case '3d':
                case 'background':
                    updates.ui!.show3DBackground = true;
                    output.push({ text: '✓ 3D background enabled', type: 'success' });
                    break;
                case 'matrix':
                    updates.ui!.showMatrixEffect = true;
                    output.push({ text: '✓ Matrix effect enabled', type: 'success' });
                    break;
                case 'button':
                case 'cmd':
                    updates.ui!.showCmdButton = true;
                    output.push({ text: '✓ CMD button enabled', type: 'success' });
                    break;
                default:
                    output.push({ text: `Error: Unknown element '${element}'`, type: 'error' });
                    output.push({ text: 'Available: 3d, matrix, button', type: 'output' });
                    return output;
            }

            updateConfig(updates);
            return output;
        }

        if (args[0] === 'hide' && args.length >= 2) {
            const element = args[1];
            const updates: Partial<SiteConfig> = { ui: { ...config.ui } };

            switch (element) {
                case '3d':
                case 'background':
                    updates.ui!.show3DBackground = false;
                    output.push({ text: '✓ 3D background disabled', type: 'success' });
                    break;
                case 'matrix':
                    updates.ui!.showMatrixEffect = false;
                    output.push({ text: '✓ Matrix effect disabled', type: 'success' });
                    break;
                case 'button':
                case 'cmd':
                    updates.ui!.showCmdButton = false;
                    output.push({ text: '✓ CMD button disabled', type: 'success' });
                    break;
                default:
                    output.push({ text: `Error: Unknown element '${element}'`, type: 'error' });
                    return output;
            }

            updateConfig(updates);
            return output;
        }

        if (args[0] === 'opacity' && args.length >= 2) {
            const value = parseInt(args[1]);
            if (isNaN(value) || value < 0 || value > 100) {
                output.push({ text: 'Error: Opacity must be 0-100', type: 'error' });
                return output;
            }

            updateConfig({ ui: { ...config.ui, terminalOpacity: value } });
            output.push({ text: `✓ Terminal opacity set to ${value}%`, type: 'success' });
            return output;
        }

        if (args[0] === 'glass' && args.length >= 2) {
            const enabled = args[1] === 'on' || args[1] === 'true';
            updateConfig({ ui: { ...config.ui, glassEffect: enabled } });
            output.push({ text: `✓ Glass effect ${enabled ? 'enabled' : 'disabled'}`, type: 'success' });
            return output;
        }

        if (args[0] === 'border' && args.length >= 2) {
            const value = args[1];
            updateConfig({ ui: { ...config.ui, borderRadius: value } });
            output.push({ text: `✓ Border radius set to ${value}`, type: 'success' });
            return output;
        }

        if (args[0] === 'mode' && args.length >= 2) {
            const mode = args[1];
            if (mode === 'edit' || mode === 'view') {
                updateConfig({ mode: mode as 'view' | 'edit' });
                output.push({ text: `✓ UI mode set to ${mode}`, type: 'success' });
            } else {
                output.push({ text: 'Error: Mode must be "edit" or "view"', type: 'error' });
            }
            return output;
        }

        output.push({ text: 'Usage: ui [show|hide <element>|opacity <0-100>|glass <on|off>|border <value>|mode <edit|view>]', type: 'output' });
        return output;
    }

    // Font commands
    static handleFontCommand(
        args: string[],
        config: SiteConfig,
        updateConfig: (updates: Partial<SiteConfig>) => void
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0 || args[0] === 'list') {
            output.push({ text: '=== Available Fonts ===', type: 'success' });
            output.push({ text: '"JetBrains Mono", "Fira Code", "Courier New"', type: 'output' });
            output.push({ text: '"Monaco", "Consolas", "monospace"', type: 'output' });
            output.push({ text: '\nCurrent: ' + config.typography.fontFamily, type: 'output' });
            return output;
        }

        if (args[0] === 'family' && args.length >= 2) {
            const family = args.slice(1).join(' ').replace(/['"]/g, '');
            updateConfig({
                typography: {
                    ...config.typography,
                    fontFamily: family,
                },
            });
            output.push({ text: `✓ Font family set to ${family}`, type: 'success' });
            return output;
        }

        if (args[0] === 'size' && args.length >= 2) {
            const value = args[1];
            updateConfig({
                typography: {
                    ...config.typography,
                    fontSize: {
                        ...config.typography.fontSize,
                        terminal: value,
                    },
                },
            });
            output.push({ text: `✓ Font size set to ${value}`, type: 'success' });
            return output;
        }

        output.push({ text: 'Usage: font [list|family <name>|size <value>]', type: 'output' });
        return output;
    }

    // Text customization commands
    static handleTextCommand(
        args: string[],
        config: SiteConfig,
        updateConfig: (updates: Partial<SiteConfig>) => void
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0) {
            output.push({ text: '=== Current Text Settings ===', type: 'success' });
            output.push({ text: `System Name: ${config.text.systemName}`, type: 'output' });
            output.push({ text: `Username: ${config.text.username}`, type: 'output' });
            output.push({ text: `Prompt: ${config.terminal.prompt}`, type: 'output' });
            return output;
        }

        if (args[0] === 'set' && args.length >= 3) {
            const property = args[1];
            const value = args.slice(2).join(' ');

            switch (property) {
                case 'system':
                case 'systemname':
                    updateConfig({ text: { ...config.text, systemName: value } });
                    output.push({ text: `✓ System name set to ${value}`, type: 'success' });
                    break;
                case 'username':
                case 'user':
                    updateConfig({ text: { ...config.text, username: value } });
                    output.push({ text: `✓ Username set to ${value}`, type: 'success' });
                    break;
                case 'prompt':
                    updateConfig({ terminal: { ...config.terminal, prompt: value } });
                    output.push({ text: `✓ Prompt set to ${value}`, type: 'success' });
                    break;
                default:
                    output.push({ text: `Error: Unknown property '${property}'`, type: 'error' });
                    output.push({ text: 'Available: system, username, prompt', type: 'output' });
                    return output;
            }

            return output;
        }

        output.push({ text: 'Usage: text set <property> <value>', type: 'output' });
        return output;
    }

    // Config management commands
    static handleConfigCommand(
        args: string[],
        config: SiteConfig,
        exportConfig: () => string,
        importConfig: (json: string) => boolean,
        saveNamed: (name: string) => void,
        loadNamed: (name: string) => boolean,
        getSavedNames: () => string[],
        deleteNamed: (name: string) => void,
        resetConfig: () => void
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0 || args[0] === 'help') {
            output.push({ text: '=== Config Commands ===', type: 'success' });
            output.push({ text: 'config export - Copy config to clipboard', type: 'output' });
            output.push({ text: 'config export <name> - Save config with name', type: 'output' });
            output.push({ text: 'config import - Import from clipboard', type: 'output' });
            output.push({ text: 'config import <name> - Load saved config', type: 'output' });
            output.push({ text: 'config list - List saved configs', type: 'output' });
            output.push({ text: 'config delete <name> - Delete saved config', type: 'output' });
            output.push({ text: 'config reset - Reset to defaults', type: 'output' });
            return output;
        }

        if (args[0] === 'export') {
            if (args.length >= 2) {
                const name = args[1];
                saveNamed(name);
                output.push({ text: `✓ Config saved as '${name}'`, type: 'success' });
            } else {
                const json = exportConfig();
                navigator.clipboard.writeText(json).then(() => {
                    output.push({ text: '✓ Config copied to clipboard', type: 'success' });
                }).catch(() => {
                    output.push({ text: '✗ Failed to copy to clipboard', type: 'error' });
                });
            }
            return output;
        }

        if (args[0] === 'import') {
            if (args.length >= 2) {
                const name = args[1];
                if (loadNamed(name)) {
                    output.push({ text: `✓ Config '${name}' loaded`, type: 'success' });
                } else {
                    output.push({ text: `✗ Config '${name}' not found`, type: 'error' });
                }
            } else {
                output.push({ text: 'Paste your config JSON and press Enter', type: 'system' });
            }
            return output;
        }

        if (args[0] === 'list') {
            const names = getSavedNames();
            if (names.length === 0) {
                output.push({ text: 'No saved configs', type: 'output' });
            } else {
                output.push({ text: '=== Saved Configs ===', type: 'success' });
                names.forEach((name, i) => {
                    output.push({ text: `${i + 1}. ${name}`, type: 'output' });
                });
            }
            return output;
        }

        if (args[0] === 'delete' && args.length >= 2) {
            const name = args[1];
            deleteNamed(name);
            output.push({ text: `✓ Config '${name}' deleted`, type: 'success' });
            return output;
        }

        if (args[0] === 'reset') {
            resetConfig();
            output.push({ text: '✓ Config reset to defaults', type: 'success' });
            return output;
        }

        output.push({ text: 'Usage: config [export|import|list|delete|reset]', type: 'output' });
        return output;
    }

    // Theme preset commands
    static handleThemeCommand(
        args: string[],
        loadPreset: (name: string) => boolean
    ): TerminalLine[] {
        const output: TerminalLine[] = [];

        if (args.length === 0 || args[0] === 'list') {
            const themes = getThemeNames();
            output.push({ text: '=== Available Themes ===', type: 'success' });
            themes.forEach((name, i) => {
                output.push({ text: `${i + 1}. ${name}`, type: 'output' });
            });
            return output;
        }

        if (args[0] === 'preset' && args.length >= 2) {
            const name = args[1];
            if (loadPreset(name)) {
                output.push({ text: `✓ Theme '${name}' loaded`, type: 'success' });
            } else {
                output.push({ text: `✗ Theme '${name}' not found`, type: 'error' });
                output.push({ text: 'Use "theme list" to see available themes', type: 'output' });
            }
            return output;
        }

        output.push({ text: 'Usage: theme [list|preset <name>]', type: 'output' });
        return output;
    }
}
