import { FontBridge } from '@/components/editor/FontBridge';
import FormatModal from '@/components/FormatModal';
import RichTextToolbar from '@/components/RichTextToolbar';
import { useNotes } from '@/context/NotesContext';
import { useTheme } from '@/context/ThemeContext';
import { getContrastColor, isLightColor } from '@/utils/colors';
import { CoreBridge, PlaceholderBridge, RichText, TenTapStartKit, useEditorBridge } from '@10play/tentap-editor';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Check } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = ['#ffffff', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#9bf6ff', '#a0c4ff', '#bdb2ff', '#ffc6ff'];

export default function NewNoteScreen() {
    const router = useRouter();
    const { addNote } = useNotes();
    const { colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    const [title, setTitle] = useState('');
    const [selectedColor, setSelectedColor] = useState('#ffffff');
    const [showFormatModal, setShowFormatModal] = useState(false);

    // Default CSS to match system appearance
    const whiteModeCSS = `
        body { background-color: #F5F5F7; color: #000000; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        * { outline: none; }
        p { margin-bottom: 0.5em; line-height: 1.5; }
        /* Hide Tiptap Placeholder Aggressively */
        .ProseMirror p.is-editor-empty:first-child::before { content: none !important; display: none !important; }
        p.is-editor-empty::before { display: none !important; }
    `;
    const darkModeCSS = `
        body { background-color: #000000; color: #ffffff; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        * { outline: none; }
        p { margin-bottom: 0.5em; line-height: 1.5; }
        /* Hide Tiptap Placeholder Aggressively */
        .ProseMirror p.is-editor-empty:first-child::before { content: none !important; display: none !important; }
        p.is-editor-empty::before { display: none !important; }
    `;

    // Initialize Rich Text Editor
    const editor = useEditorBridge({
        autofocus: true,
        avoidIosKeyboard: true,
        initialContent: '<h1></h1><p></p>',
        bridgeExtensions: [...TenTapStartKit, CoreBridge, PlaceholderBridge, FontBridge],
        theme: {
            webview: { backgroundColor: isDark ? 'black' : '#F5F5F7' },
        }
    });

    // Helper to extract hashtags from HTML content
    const extractTagsFromHTML = (html: string): string[] => {
        // 1. Remove HTML tags to get plain text
        const plainText = html.replace(/<[^>]+>/g, ' ');
        // 2. Find hashtags
        const matches = plainText.match(/#[\w\u0590-\u05ff]+/g);
        return matches ? matches : [];
    };

    const handleSave = async () => {
        const content = await editor.getHTML();
        const plainText = await editor.getText();

        if (!title.trim() && !plainText.trim()) {
            router.back();
            return;
        }

        const finalTitle = title.trim() || 'New Note';
        const tags = extractTagsFromHTML(content);

        addNote({
            title: finalTitle,
            content: content,
            color: selectedColor,
            tags: tags,
            isPinned: false
        });
        router.back();
    };

    // Determine text color based on background luminance
    const isDefaultBg = selectedColor === '#ffffff' || selectedColor === '#fff';
    const effectiveTextColor = isDefaultBg
        ? (isDark ? '#ffffff' : '#000000')
        : getContrastColor(selectedColor);

    return (
        <View style={[styles.container, { backgroundColor: selectedColor }]}>
            <StatusBar style={isDefaultBg ? (isDark ? 'light' : 'dark') : (isLightColor(selectedColor) ? 'dark' : 'light')} />
            {/* Header */}
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={effectiveTextColor} />
                </TouchableOpacity>

                {/* Right Actions */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Save Action */}
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                    >
                        <Check size={20} color={isLightColor(selectedColor) ? '#000' : '#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0} // Adjust offset if needed
            >
                <View style={{ flex: 1, position: 'relative' }}>
                    <ScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} // Add extra padding for Toolbar
                    >
                        {/* Title Input */}
                        <TextInput
                            style={[styles.titleInput, { color: effectiveTextColor }]}
                            value={title}
                            onChangeText={setTitle}
                            placeholder="Title"
                            placeholderTextColor={isDefaultBg ? "gray" : (isLightColor(selectedColor) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)')}
                            autoFocus={true}
                        />

                        {/* Rich Text Editor */}
                        {/* We apply a wrapper style to make it seamless */}
                        <View style={{ flex: 1, minHeight: 400, backgroundColor: selectedColor }}>
                            <RichText
                                editor={editor}
                                style={{ backgroundColor: 'transparent' }} // Ensure WebView doesn't have its own white bg if possible
                                injectedJavaScript={`
                                    const style = document.createElement('style');
                                    style.innerHTML = \`
                                        body { background-color: transparent; color: ${effectiveTextColor}; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
                                        /* Default Paragraph Styling */
                                        p { font-size: 17px; line-height: 1.5; margin-bottom: 0.8em; }
                                        /* Headings */
                                        h1 { font-size: 24px; font-weight: 700; margin-bottom: 0.5em; }
                                        h2 { font-size: 20px; font-weight: 600; margin-bottom: 0.5em; }
                                        /* Lists */
                                        ul, ol { padding-left: 20px; margin-bottom: 1em; }
                                        li { margin-bottom: 0.2em; }
                                        * { outline: none; }
                                        p.is-editor-empty:first-child::before { content: none !important; display: none !important; } 
                                        .ProseMirror p.is-editor-empty:first-child::before { display: none !important; }
                                    \`;
                                    document.head.appendChild(style);
                                    true;
                                `}
                            />
                        </View>
                    </ScrollView>

                    {/* Rich Text Toolbar (Overlay) */}
                </View>
            </KeyboardAvoidingView>

            {/* Rich Text Toolbar (Floating) */}
            <RichTextToolbar
                editor={editor}
                selectedColor={selectedColor}
                onColorSelect={setSelectedColor}
                onFormatPress={() => setShowFormatModal(true)}
            />

            <FormatModal
                visible={showFormatModal}
                onClose={() => setShowFormatModal(false)}
                editor={editor}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconButton: {
        padding: 8,
    },
    saveButton: {
        backgroundColor: '#b8e82a',
        padding: 8,
        borderRadius: 999,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 24,
    },
    colorDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 200, // Above toolbar
    },
    colorModalContent: {
        width: '85%',
        padding: 24,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
    },
    bigSwatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    // Removed old color button styles? Keep just in case or delete if unused.
    titleInput: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 0,
        // Removed marginTop
    },
});
