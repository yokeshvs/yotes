import { useTheme } from '@/context/ThemeContext';
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

    // If note is default white, turn it black in dark mode (adaptive).
    // Otherwise keep the user's selected color.
    const isDefaultWhite = color === '#ffffff' || color === '#fff';
    const finalBackgroundColor = (isDark && isDefaultWhite) ? '#18181b' : color; // using zinc-900 for nicer black

    // Text color contrast
    const textColor = (isDark && isDefaultWhite) ? '#ffffff' : '#111827';
    const contentColor = (isDark && isDefaultWhite) ? '#9ca3af' : '#374151';
    const dateColor = (isDark && isDefaultWhite) ? '#6b7280' : '#6b7280';
    const borderColor = (isDark && isDefaultWhite) ? '#27272a' : 'transparent'; // border for dark mode cards

    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={onLongPress}
            style={{ marginBottom: 16, width: '100%' }} // Layout props moved here
            activeOpacity={0.8}
        >
            <Animated.View
                sharedTransitionTag={`note-bg-${id}`}
                style={[
                    styles.card,
                    { backgroundColor: finalBackgroundColor, borderColor: borderColor, borderWidth: isDark ? 1 : 0, marginBottom: 0 }, // marginBottom handled by wrapper
                    isSelectionMode && isSelected && { borderColor: '#b8e82a', borderWidth: 2 }
                ]}
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
                            .replace(/<\/p>/gi, '\n')
                            .replace(/<br\s*\/?>/gi, '\n')
                            .replace(/<\/div>/gi, '\n')
                            .replace(/<[^>]+>/g, '')
                            .trim()}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.date, { color: dateColor }]}>
                        {date}
                    </Text>
                </View>
            </Animated.View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        width: '100%',
        borderRadius: 32,
        padding: 24,
        marginBottom: 16,
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
