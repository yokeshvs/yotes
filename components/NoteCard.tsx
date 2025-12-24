import { useTheme } from '@/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { CheckCircle2, Circle, Pin } from 'lucide-react-native';

interface NoteCardProps {
    id: string; // Added for Shared Element Tag
    title: string;
    content: string;
    date: string;
    color: string;
    isPinned?: boolean;
    isSelectionMode?: boolean;
    isSelected?: boolean;
    onPress: () => void;
    onLongPress?: () => void;
}

export function NoteCard({ id, title, content, date, color, isPinned, isSelectionMode, isSelected, onPress, onLongPress }: NoteCardProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    // Glass effect colors - Semi-transparent logic
    // Default white cards become semi-transparent white in light mode, semi-transparent black in dark mode.
    // Colored cards keep their color but with opacity to let gradient show through (optional, or keeping them solid for contrast).
    // Let's go with: Default cards = Glass. Colored cards = Solid (or slightly glassy).

    const isDefaultWhite = color === '#ffffff' || color === '#fff';

    // Default cards get distinct dark/light tints. Colored cards remain solid.
    const glassBackgroundColor = isDefaultWhite
        ? (isDark ? 'rgba(30,30,30,0.45)' : 'rgba(255,255,255,0.45)')
        : color;

    // Text color contrast
    const textColor = (isDark && isDefaultWhite) ? '#ffffff' : '#111827';
    const contentColor = (isDark && isDefaultWhite) ? '#9ca3af' : '#374151';
    const dateColor = (isDark && isDefaultWhite) ? '#6b7280' : '#6b7280';
    const borderColor = (isDark && isDefaultWhite) ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)';

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ marginBottom: 10, width: '100%' }}
            activeOpacity={0.8}
        >
            <Animated.View
                sharedTransitionTag={`note-bg-${id}`}
                style={[
                    styles.card,
                    {
                        backgroundColor: 'transparent', // Transparent for glass
                        borderColor: borderColor,
                        borderWidth: 1,
                        overflow: 'hidden', // Clip BlurView
                        padding: 0 // Remove padding from container, move to BlurView
                    },
                    isSelectionMode && isSelected && { borderColor: '#b8e82a', borderWidth: 2 }
                ]}
            >
                <BlurView
                    intensity={isDefaultWhite ? 40 : 0} // Blur only default white cards
                    tint={isDark ? 'dark' : 'light'}
                    style={{ flex: 1, padding: 24, backgroundColor: glassBackgroundColor }}
                >
                    <View>
                        <View className="flex-row justify-between items-start mb-2">
                            <Text style={[styles.title, { color: textColor, flex: 1, paddingRight: isSelectionMode ? 24 : 0 }]} numberOfLines={2}>
                                {title}
                            </Text>
                            {isPinned && !isSelectionMode && (
                                <View className="justify-center ml-2">
                                    <Pin size={18} color={textColor} style={{ opacity: 1 }} />
                                </View>
                            )}
                        </View>

                        {isSelectionMode && (
                            <View className="absolute top-0 right-0">
                                {isSelected ? (
                                    <CheckCircle2 size={24} color="#b8e82a" fill={isDark ? "black" : "white"} />
                                ) : (
                                    <Circle size={24} color={isDark ? "#52525b" : "#d1d5db"} />
                                )}
                            </View>
                        )}

                        <Text style={[styles.content, { color: contentColor }]} numberOfLines={6}>
                            {content
                                .replace(/<ul[^>]*>/gi, '') // Remove ul tags
                                .replace(/<ol[^>]*>/gi, '') // Remove ol tags
                                .replace(/<li[^>]*>/gi, '\n• ') // Convert list items to bullets
                                .replace(/<input[^>]*type="checkbox"[^>]*checked[^>]*>/gi, '\n[x] ') // Checked box
                                .replace(/<input[^>]*type="checkbox"[^>]*>/gi, '\n[ ] ') // Unchecked box
                                .replace(/<\/p>/gi, '\n')
                                .replace(/<br\s*\/?>/gi, '\n')
                                .replace(/<\/div>/gi, '\n')
                                .replace(/<[^>]+>/g, '') // Strip remaining tags
                                .replace(/&nbsp;/g, ' ')
                                .replace(/&amp;/g, '&')
                                .replace(/&lt;/g, '<')
                                .replace(/&gt;/g, '>')
                                .replace(/&quot;/g, '"')
                                .trim()}
                        </Text>
                    </View>
                    <View>
                        <Text style={[styles.date, { color: dateColor }]}>
                            {date}
                        </Text>
                    </View>
                </BlurView>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        marginBottom: 0,
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    content: {
        fontSize: 14,
        color: '#374151',
        lineHeight: 20,
    },
    date: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6b7280',
        alignSelf: 'flex-end',
        marginTop: 16,
        textAlign: 'right',
    },
});
