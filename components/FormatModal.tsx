import { useTheme } from '@/context/ThemeContext';
import { EditorBridge, useBridgeState } from '@10play/tentap-editor';
import { BlurView } from 'expo-blur';
import { Bold, CheckSquare, Italic, List, ListOrdered, Strikethrough, Underline, X } from 'lucide-react-native';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FormatModalProps {
    visible: boolean;
    onClose: () => void;
    editor: EditorBridge;
}

export default function FormatModal({ visible, onClose, editor }: FormatModalProps) {
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';
    const textColor = isDark ? '#fff' : '#000';
    const activeColor = '#b8e82a'; // The user's requested Green Theme
    const editorState = useBridgeState(editor) as any;

    const SectionLabel = ({ title }: { title: string }) => (
        <Text style={[styles.sectionLabel, { color: textColor }]}>{title}</Text>
    );

    // Helper for Style Pills (Segmented Control)
    const StylePill = ({ label, isActive, onPress, isFont = false }: { label: string, isActive: boolean, onPress: () => void, isFont?: boolean }) => {
        return (
            <TouchableOpacity
                onPress={onPress}
                style={[
                    styles.stylePill,
                    isActive && isDark ? { backgroundColor: '#636366' } : (isActive ? styles.stylePillActive : {})
                ]}
            >
                <Text style={[
                    styles.stylePillText,
                    { color: textColor },
                    label === 'Title' && { fontSize: 16, fontWeight: '700' },
                    label === 'Heading' && { fontSize: 15, fontWeight: '600' },
                    label === 'Subheading' && { fontSize: 14, fontWeight: '600' },
                    label === 'Body' && { fontSize: 13, fontWeight: '400' },
                    isFont && label === 'Serif' && { fontFamily: 'Serif' },
                    isFont && label === 'Mono' && { fontFamily: 'Monospace' },
                ]}>
                    {label}
                </Text>
            </TouchableOpacity>
        );
    };

    // Helper for Icon Toggles (Bold, Italic, Lists)
    const IconToggle = ({ icon: Icon, onPress, isActive = false }: { icon: any, onPress: () => void, isActive?: boolean }) => (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.iconToggle,
                isActive && { backgroundColor: activeColor },
                !isActive && { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }
            ]}
        >
            <Icon size={20} color={isActive ? '#000' : textColor} strokeWidth={2} />
        </TouchableOpacity>
    );

    const isHeading1 = editorState?.headingLevel === 1;
    const isHeading2 = editorState?.headingLevel === 2;
    const isParagraph = !isHeading1 && !isHeading2;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onClose} />

                <BlurView
                    intensity={100}
                    tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                    style={styles.modalContainer}
                >
                    <View style={styles.header}>
                        <Text style={[styles.headerTitle, { color: textColor }]}>Format</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <X size={20} color={textColor} strokeWidth={2.5} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>

                        <SectionLabel title="Style" />
                        <View style={[styles.styleRow, { backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)' }]}>
                            <StylePill
                                label="Title"
                                isActive={isHeading1}
                                onPress={() => {
                                    editor.toggleHeading(1);
                                    onClose();
                                }}
                            />
                            <StylePill
                                label="Heading"
                                isActive={isHeading2}
                                onPress={() => {
                                    editor.toggleHeading(2);
                                    onClose();
                                }}
                            />
                            <StylePill
                                label="Body"
                                isActive={isParagraph}
                                onPress={() => {
                                    // Logic: if H1 or H2 is active, toggle it off to return to paragraph
                                    if (isHeading1) editor.toggleHeading(1);
                                    else if (isHeading2) editor.toggleHeading(2);
                                    // If already paragraph, do nothing or maybe ensure paragraph
                                    onClose();
                                }}
                            />
                        </View>

                        <SectionLabel title="Font" />
                        <View style={[styles.styleRow, { backgroundColor: isDark ? 'rgba(118, 118, 128, 0.24)' : 'rgba(118, 118, 128, 0.12)' }]}>
                            <StylePill label="Sans" isActive={editorState?.activeFontFamily === 'sans-serif' || !editorState?.activeFontFamily} onPress={() => { editor.setFontFamily('sans-serif'); onClose(); }} isFont />
                            <StylePill label="Serif" isActive={editorState?.activeFontFamily?.includes('serif')} onPress={() => { editor.setFontFamily('serif'); onClose(); }} isFont />
                            <StylePill label="Mono" isActive={editorState?.activeFontFamily?.includes('monospace')} onPress={() => { editor.setFontFamily('monospace'); onClose(); }} isFont />
                        </View>

                        <View style={styles.separator} />

                        <View style={styles.separator} />

                        {/* Row 2: Basic Formatting */}
                        <View style={styles.gridRow}>
                            <IconToggle icon={Bold} onPress={() => editor.toggleBold()} isActive={editorState.isBoldActive} />
                            <IconToggle icon={Italic} onPress={() => editor.toggleItalic()} isActive={editorState.isItalicActive} />
                            <IconToggle icon={Underline} onPress={() => editor.toggleUnderline()} isActive={editorState.isUnderlineActive} />
                            <IconToggle icon={Strikethrough} onPress={() => editor.toggleStrike()} isActive={editorState.isStrikeActive} />
                        </View>

                        <View style={styles.separator} />

                        {/* Row 3: Lists & Align */}
                        <View style={styles.gridRow}>
                            <IconToggle icon={List} onPress={() => { editor.toggleBulletList(); onClose(); }} isActive={editorState.isBulletListActive} />
                            <IconToggle icon={ListOrdered} onPress={() => { editor.toggleOrderedList(); onClose(); }} isActive={editorState.isOrderedListActive} />
                            <IconToggle icon={CheckSquare} onPress={() => { editor.toggleTaskList(); onClose(); }} isActive={editorState.isTaskListActive} />
                            <View style={[styles.iconToggle, { backgroundColor: 'transparent' }]} />
                        </View>

                        <View style={styles.separator} />

                        {/* Text Colors */}
                        <SectionLabel title="Text Highlight" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                            {['transparent', '#ffadad', '#ffd6a5', '#fdffb6', '#caffbf', '#a0c4ff', '#bdb2ff'].map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => editor.setHighlight(color === 'transparent' ? undefined : color)}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: color === 'transparent' ? 'white' : color },
                                        color === 'transparent' && { borderWidth: 1, borderColor: '#ccc' }
                                    ]}
                                >
                                    {color === 'transparent' && <View style={styles.slash} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <SectionLabel title="Text Color" />
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
                            {['#000000', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#64748b'].map(color => (
                                <TouchableOpacity
                                    key={color}
                                    onPress={() => editor.setColor(color)}
                                    style={[styles.colorCircle, { backgroundColor: color }]}
                                />
                            ))}
                        </ScrollView>
                    </ScrollView>
                </BlurView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContainer: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        paddingBottom: 40,
        overflow: 'hidden',
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.2)', // Base border for glass effect
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: '600',
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '500',
        marginBottom: 8,
        opacity: 0.6,
        marginLeft: 4,
    },
    closeButton: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(128,128,128,0.15)',
        borderRadius: 15,
    },
    styleRow: {
        flexDirection: 'row',
        backgroundColor: 'rgba(118, 118, 128, 0.12)',
        borderRadius: 9,
        padding: 2,
        height: 32,
        marginBottom: 16,
    },
    stylePill: {
        flex: 1,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stylePillActive: {
        backgroundColor: '#FFFFFF',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.15,
        shadowRadius: 2.0,
        elevation: 2,
    },
    stylePillText: {
        fontSize: 13,
        fontWeight: '500',
    },
    gridRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 16,
    },
    iconToggle: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(128, 128, 128, 0.1)',
    },
    separator: {
        height: 1,
        backgroundColor: 'rgba(128,128,128,0.1)',
        marginBottom: 16,
    },
    colorCircle: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    slash: {
        width: '100%',
        height: 1,
        backgroundColor: 'red',
        transform: [{ rotate: '45deg' }],
    }
});
