import { FontBridge } from '@/components/editor/FontBridge';
import { useReadyBridge } from '@/components/editor/ReadyBridge';
import FormatModal from '@/components/FormatModal';
import { NotePreview } from '@/components/NotePreview';
import RichTextToolbar from '@/components/RichTextToolbar';
import { useNotes } from '@/context/NotesContext';
import { useTheme } from '@/context/ThemeContext';
import { getContrastColor, isLightColor } from '@/utils/colors';
import { ColorBridge, CoreBridge, HighlightBridge, PlaceholderBridge, RichText, TenTapStartKit, useEditorBridge } from '@10play/tentap-editor';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ArrowLeft, Check, Trash2 } from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, InteractionManager, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NoteDetailScreen() {
    const { id: rawId } = useLocalSearchParams();
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const { notes, updateNote, deleteNote } = useNotes();
    const router = useRouter();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const insets = useSafeAreaInsets();

    const note = notes.find(n => n.id === id);

    const [title, setTitle] = useState(note?.title || '');
    const [selectedColor, setSelectedColor] = useState(note?.color || '#ffffff');
    const [isDirty, setIsDirty] = useState(false);

    // Twin View State
    const [isPreviewVisible, setIsPreviewVisible] = useState(false);
    const [isEditorReady, setIsEditorReady] = useState(true);
    const editorOpacity = useSharedValue(1);

    // Rich Text State
    const [showFormatModal, setShowFormatModal] = useState(false);

    // CSS for hiding placeholder
    const whiteModeCSS = `
        body { background-color: #F5F5F7; color: #000000; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        * { outline: none; }
        p { margin-bottom: 0.5em; line-height: 1.5; }
        .ProseMirror p.is-editor-empty:first-child::before { content: none !important; display: none !important; }
        p.is-editor-empty::before { display: none !important; }
    `;
    const darkModeCSS = `
        body { background-color: #000000; color: #ffffff; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
        * { outline: none; }
        p { margin-bottom: 0.5em; line-height: 1.5; }
        .ProseMirror p.is-editor-empty:first-child::before { content: none !important; display: none !important; }
        p.is-editor-empty::before { display: none !important; }
    `;

    // Initialize Ready Bridge
    const handleEditorReady = useCallback(() => {
        // RECEIVED SIGNAL
        console.log("ReadyBridge: Editor Loaded Signal Received");
        editorOpacity.value = withTiming(1, { duration: 300 });
        setTimeout(() => setIsPreviewVisible(false), 100);
        setIsEditorReady(true);
    }, []);

    // Fallback: If bridge fails, force ready after 1s
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isEditorReady) {
                console.log("ReadyBridge: Fallback Triggered");
                handleEditorReady();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [isEditorReady, handleEditorReady]);

    const readyBridge = useReadyBridge(handleEditorReady);

    // Initialize Rich Text Editor with existing content
    const editor = useEditorBridge({
        autofocus: false,
        avoidIosKeyboard: true,
        initialContent: note?.content || '',
        bridgeExtensions: [
            ...TenTapStartKit, CoreBridge, PlaceholderBridge, FontBridge, readyBridge, ColorBridge, HighlightBridge
        ],
        theme: {
            webview: { backgroundColor: isDark ? 'black' : '#F5F5F7' },
        }
    });

    useEffect(() => {
        if (note) {
            setTitle(note.title);
            setSelectedColor(note.color);
        }
    }, [note]);

    // Delay loading the heavy editor until transition is complete
    useEffect(() => {
        const task = InteractionManager.runAfterInteractions(() => {
            // Give a small buffer for the animation to be 100% physically done
            setTimeout(() => {
                setIsEditorReady(true);
            }, 500);
        });

        return () => task.cancel();
    }, []);

    // Old timer logic replaced by onMessage handler in RichText
    // We strictly wait for the webview to tell us it is ready.
    const editorAnimatedStyle = useAnimatedStyle(() => ({
        opacity: editorOpacity.value,
    }));

    const extractTagsFromHTML = (html: string): string[] => {
        const plainText = html.replace(/<[^>]+>/g, ' ');
        const matches = plainText.match(/#[\w\u0590-\u05ff]+/g);
        return matches ? matches : [];
    };

    const handleSave = async () => {
        console.log("Handle Save Clicked");
        if (!note) {
            console.error("Note not found during save");
            Alert.alert("Error", "Note not found");
            return;
        }

        try {
            console.log("Getting HTML content...");
            const currentContent = await editor.getHTML();
            console.log("Content retrieved length:", currentContent?.length);

            const tags = extractTagsFromHTML(currentContent);

            console.log("Updating note:", note.id);
            updateNote(note.id, {
                title,
                content: currentContent,
                color: selectedColor,
                tags
            });
            setIsDirty(false);
            router.back();
        } catch (e) {
            console.error("Save failed:", e);
            Alert.alert("Save Error", "Failed to save note");
        }
    };

    const handleDelete = () => {
        if (!note) return;
        Alert.alert(
            "Delete Note",
            "Are you sure you want to delete this note?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                        deleteNote(note.id);
                        router.back();
                    }
                }
            ]
        );
    };

    if (!note) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={{ color: isDark ? 'white' : 'black' }}>Note not found</Text>
            </View>
        );
    }

    // Determine text color based on background luminance
    // If background is white/default, follow theme.
    // If background is custom color, calculate contrast.
    const isDefaultBg = selectedColor === '#ffffff' || selectedColor === '#fff';
    const effectiveTextColor = isDefaultBg
        ? (isDark ? '#ffffff' : '#000000')
        : getContrastColor(selectedColor);

    return (
        <Animated.View
            sharedTransitionTag={`note-bg-${Array.isArray(id) ? id[0] : id}`}
            style={[styles.container, { backgroundColor: selectedColor }]}
        >
            <StatusBar style={isDefaultBg ? (isDark ? 'light' : 'dark') : (isLightColor(selectedColor) ? 'dark' : 'light')} />
            <View style={[styles.header, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.iconButton}>
                    <ArrowLeft size={24} color={effectiveTextColor} />
                </TouchableOpacity>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {/* Delete Action */}
                    <TouchableOpacity onPress={handleDelete} style={[styles.iconButton]}>
                        <Trash2 size={24} color="#ef4444" />
                    </TouchableOpacity>

                    {/* Color dot removed from header, moved to toolbar */}

                    {/* Save Action */}
                    <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                        <Check size={20} color={isLightColor(selectedColor) ? '#000' : '#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
            >
                <View style={{ flex: 1, position: 'relative' }}>
                    <ScrollView
                        style={styles.contentContainer}
                        contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }}
                    >
                        <TextInput
                            style={[styles.titleInput, { color: effectiveTextColor }]}
                            value={title}
                            onChangeText={(t) => { setTitle(t); setIsDirty(true); }}
                            placeholder="Title"
                            placeholderTextColor={isDefaultBg ? "gray" : (isLightColor(selectedColor) ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)')}
                        />

                        {/* Editor Container */}
                        <View style={{ flex: 1, minHeight: 400, backgroundColor: selectedColor, position: 'relative' }}>

                            {/* 1. Static Native Preview (Immediate) */}
                            {/* We keep this visible until editor fully opaque. */}
                            {isPreviewVisible && (
                                <TouchableOpacity
                                    activeOpacity={1}
                                    onPress={handleEditorReady}
                                    style={[StyleSheet.absoluteFill, { zIndex: 2 }]}
                                >
                                    <NotePreview content={note.content} textColor={effectiveTextColor} />
                                </TouchableOpacity>
                            )}

                            {/* 2. Heavy Web Editor (Lazy Loaded) */}
                            {/* Always render so it can initialize, just hide it until ready */}
                            <Animated.View style={[{ flex: 1 }, editorAnimatedStyle, { zIndex: 1 }]}>
                                <RichText
                                    editor={editor}
                                    style={{ backgroundColor: 'transparent' }}
                                    injectedJavaScript={`
                                            const style = document.createElement('style');
                                            style.innerHTML = \`
                                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                                body { background-color: transparent; color: ${effectiveTextColor}; font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
                                                /* Default Paragraph Styling */
                                                p { font-size: 17px; line-height: 24px; margin-bottom: 12px; margin-top: 0; }
                                                p.is-editor-empty:first-child::before { content: none !important; display: none !important; } 
                                                .ProseMirror p.is-editor-empty:first-child::before { display: none !important; }
                                            \`;
                                            document.head.appendChild(style);
                                            
                                            // Send Ready Signal via Bridge
                                            if (document.readyState === 'complete') {
                                                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EDITOR_LOADED', payload: null }));
                                            } else {
                                                window.addEventListener('load', () => {
                                                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'EDITOR_LOADED', payload: null }));
                                                });
                                            }
                                            true;
                                        `}
                                />
                            </Animated.View>
                        </View>
                    </ScrollView>

                    {/* Rich Text Toolbar (Floating) */}
                    {isEditorReady && (
                        <RichTextToolbar
                            editor={editor}
                            onFormatPress={() => setShowFormatModal(true)}
                            selectedColor={selectedColor}
                            onColorSelect={(c) => {
                                setSelectedColor(c);
                                setIsDirty(true);
                            }}
                        />
                    )}
                </View>
            </KeyboardAvoidingView>

            {/* Formatting Modal */}
            <FormatModal
                visible={showFormatModal}
                onClose={() => setShowFormatModal(false)}
                editor={editor}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centered: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
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
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    colorModalContent: {
        width: '80%',
        padding: 24,
        borderRadius: 24,
        overflow: 'hidden',
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    colorGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 12,
    },
    bigSwatch: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    titleInput: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 16,
        paddingHorizontal: 0,
    },
});
