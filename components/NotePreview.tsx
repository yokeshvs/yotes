import { useTheme } from '@/context/ThemeContext';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotePreviewProps {
    content: string;
    textColor: string;
}

export function NotePreview({ content, textColor }: NotePreviewProps) {
    const { colorScheme } = useTheme();

    // Simple HTML stripper that preserves paragraph breaks
    const textContent = useMemo(() => {
        if (!content) return "";

        // Replace <p> and <br> with newlines
        let text = content
            .replace(/<p[^>]*>/g, '')
            .replace(/<\/p>/g, '\n\n')
            .replace(/<br\s*\/?>/g, '\n');

        // Strip remaining tags
        text = text.replace(/<[^>]+>/g, '');

        // Decode common entities
        text = text
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');

        return text.trim();
    }, [content]);

    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: textColor }]}>
                {textContent}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // Match the webview's internal padding/margin if possible
    },
    text: {
        fontSize: 17, // Must match editor CSS
        lineHeight: 24, // Explicit px
        fontFamily: '-apple-system',
        marginBottom: 12, // Explicit px
    }
});
