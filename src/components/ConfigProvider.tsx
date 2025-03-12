'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteConfig, ConfigManager, defaultConfig } from '@/lib/siteConfig';

interface ConfigContextType {
    config: SiteConfig;
    updateConfig: (updates: Partial<SiteConfig>) => void;
    resetConfig: () => void;
    loadPreset: (name: string) => boolean;
    exportConfig: () => string;
    importConfig: (jsonString: string) => boolean;
    saveNamed: (name: string) => void;
    loadNamed: (name: string) => boolean;
    getSavedNames: () => string[];
    deleteNamed: (name: string) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
    const [config, setConfig] = useState<SiteConfig>(defaultConfig);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load config from localStorage on mount
    useEffect(() => {
        const loaded = ConfigManager.getConfig();
        setConfig(loaded);
        ConfigManager.applyConfig(loaded);
        setIsInitialized(true);
    }, []);

    // Apply config changes to document
    useEffect(() => {
        if (isInitialized) {
            ConfigManager.applyConfig(config);
            ConfigManager.saveConfig(config);
        }
    }, [config, isInitialized]);

    const updateConfig = (updates: Partial<SiteConfig>) => {
        setConfig(prev => {
            const newConfig = { ...prev };

            // Deep merge for nested objects
            if (updates.colors) {
                newConfig.colors = { ...prev.colors, ...updates.colors };
                if (updates.colors.terminal) {
                    newConfig.colors.terminal = { ...prev.colors.terminal, ...updates.colors.terminal };
                }
            }
            if (updates.typography) {
                newConfig.typography = { ...prev.typography, ...updates.typography };
                if (updates.typography.fontSize) {
                    newConfig.typography.fontSize = { ...prev.typography.fontSize, ...updates.typography.fontSize };
                }
            }
            if (updates.ui) {
                newConfig.ui = { ...prev.ui, ...updates.ui };
            }
            if (updates.terminal) {
                newConfig.terminal = { ...prev.terminal, ...updates.terminal };
            }
            if (updates.text) {
                newConfig.text = { ...prev.text, ...updates.text };
                if (updates.text.welcomeMessage) {
                    newConfig.text.welcomeMessage = updates.text.welcomeMessage;
                }
            }

            return newConfig;
        });
    };

    const resetConfig = () => {
        setConfig(defaultConfig);
        ConfigManager.resetConfig();
    };

    const loadPreset = (name: string) => {
        const { getTheme } = require('@/lib/configPresets');
        const preset = getTheme(name);
        if (preset) {
            setConfig(preset);
            return true;
        }
        return false;
    };

    const exportConfig = () => {
        return ConfigManager.exportConfig(config);
    };

    const importConfig = (jsonString: string): boolean => {
        const imported = ConfigManager.importConfig(jsonString);
        if (imported) {
            setConfig(imported);
            return true;
        }
        return false;
    };

    const saveNamed = (name: string) => {
        ConfigManager.saveNamedConfig(name, config);
    };

    const loadNamed = (name: string): boolean => {
        const loaded = ConfigManager.loadNamedConfig(name);
        if (loaded) {
            setConfig(loaded);
            return true;
        }
        return false;
    };

    const getSavedNames = (): string[] => {
        return Object.keys(ConfigManager.getSavedConfigs());
    };

    const deleteNamed = (name: string) => {
        ConfigManager.deleteNamedConfig(name);
    };

    return (
        <ConfigContext.Provider
            value={{
                config,
                updateConfig,
                resetConfig,
                loadPreset,
                exportConfig,
                importConfig,
                saveNamed,
                loadNamed,
                getSavedNames,
                deleteNamed,
            }}
        >
            {children}
        </ConfigContext.Provider>
    );
}

export function useConfig() {
    const context = useContext(ConfigContext);
    if (!context) {
        throw new Error('useConfig must be used within ConfigProvider');
    }
    return context;
}
