import { BlurView } from 'expo-blur';
import React from 'react';
import { View, ViewProps } from 'react-native';

// We need a simple way to combine classes if we don't have clsx/tail-merge helper setup yet.
// I installed clsx tailwind-merge so I should create the utility.

interface GlassCardProps extends ViewProps {
    className?: string;
    intensity?: number;
}

export function GlassCard({ className, intensity = 50, children, ...props }: GlassCardProps) {
    return (
        <View className={`overflow-hidden rounded-2xl border border-white/20 bg-white/10 ${className}`} {...props}>
            <BlurView intensity={intensity} tint="light" className="p-4">
                {children}
            </BlurView>
        </View>
    );
}
