import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNWColorScheme } from 'nativewind';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as _useColorScheme } from 'react-native';

export type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: ThemeType;
    colorScheme: NonNullable<ColorSchemeName>;
    setTheme: (theme: ThemeType) => void;
}

/**
 * ThemeContext
 * 
 * Manages the application's visual theme (Light, Dark, or System).
 * - Integrates with NativeWind to apply Tailwind dark mode classes.
 * - Persists user preference to AsyncStorage.
 * - Listens to system changes when in 'system' mode.
 */
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = _useColorScheme();
    const { setColorScheme: setNWColorScheme } = useNWColorScheme();
    const [theme, setThemeState] = useState<ThemeType>('system');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('userTheme');
                if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
                    setThemeState(savedTheme);
                    setNWColorScheme(savedTheme);
                } else {
                    // Default to system if nothing saved
                    setNWColorScheme('system');
                }
            } catch (error) {
                console.error('Failed to load theme', error);
            } finally {
                setIsReady(true);
            }
        };
        loadTheme();
    }, []);

    const setTheme = async (newTheme: ThemeType) => {
        setThemeState(newTheme);
        setNWColorScheme(newTheme);
        try {
            await AsyncStorage.setItem('userTheme', newTheme);
        } catch (error) {
            console.error('Failed to save theme', error);
        }
    };

    const resolvedColorScheme: NonNullable<ColorSchemeName> =
        theme === 'system'
            ? (systemColorScheme ?? 'light')
            : theme;

    if (!isReady) {
        return null; // Or a splash screen placeholder
    }

    return (
        <ThemeContext.Provider value={{ theme, colorScheme: resolvedColorScheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
