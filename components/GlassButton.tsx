import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface GlassButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: ViewStyle;
    tint?: 'light' | 'dark' | 'default';
}

export function GlassButton({ onPress, children, style, tint }: GlassButtonProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    // If tint is explicitly passed, use it. Otherwise adapt to system theme.
    const blurTint = tint || (isDark ? 'dark' : 'light');

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.container, style]}
        >
            <BlurView
                intensity={80}
                tint={blurTint}
                style={styles.blur}
            >
                {children}
            </BlurView>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        width: 44,
        height: 44,
        borderRadius: 22,
        overflow: 'hidden',
        // Shadow for depth
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
    blur: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        // Slight color tint overlay if needed, usually managed by 'tint' prop
        backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.8)' : undefined,
    },
});
