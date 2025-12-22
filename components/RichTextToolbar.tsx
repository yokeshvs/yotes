import { useTheme } from '@/context/ThemeContext';
import { EditorBridge, useBridgeState } from '@10play/tentap-editor';
import { BlurView } from 'expo-blur';
import { Bold, CheckSquare, ChevronDown, ChevronRight, Italic, List, Palette, Strikethrough, Underline } from 'lucide-react-native';
import { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

interface RichTextToolbarProps {
    editor: EditorBridge;
    onFormatPress?: () => void;
    selectedColor: string;
    onColorSelect: (color: string) => void;
}

const COLORS = [
    '#ffffff', // White
    '#ffadad', // Red Light
    '#ffd6a5', // Orange Light
    '#fdffb6', // Yellow Light
    '#caffbf', // Green Light
    '#9bf6ff', // Cyan Light
    '#a0c4ff', // Blue Light
    '#bdb2ff', // Purple Light
    '#ffc6ff', // Pink Light
    '#e0e0e0', // Gray Light
    '#ffcfd2', // Salmon
    '#fde4cf', // Peach
    '#fbf8cc', // Lemon
    '#b9fbc0', // Mint
    '#98f5e1', // Aqua
    '#8eecf5', // Sky
    '#90dbf4', // Blue
    '#a3c4f3', // Periwinkle
    '#cfbaf0', // Lilac
    '#f1c0e8', // Rose
];

export default function RichTextToolbar({ editor, onFormatPress, selectedColor, onColorSelect }: RichTextToolbarProps) {
    const { colorScheme } = useTheme();
    const editorState = useBridgeState(editor) as any;
    const isDark = colorScheme === 'dark';
    const iconColor = isDark ? '#fff' : '#000';
    const activeColor = '#b8e82a'; // Green Theme

    const [isFormatExpanded, setIsFormatExpanded] = useState(false);
    const [isColorExpanded, setIsColorExpanded] = useState(false);

    const handleColorSelect = (color: string) => {
        // editor.setColor(color); // Removed: Now used for background
        onColorSelect(color);
        closeAll(); // Auto-close on selection
    };

    const toggleFormat = () => {
        const toExpanded = !isFormatExpanded;
        LayoutAnimation.configureNext({
            duration: 400, // Slightly faster for responsiveness
            create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
            update: { type: LayoutAnimation.Types.easeInEaseOut },
            delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        });
        setIsFormatExpanded(toExpanded);
        if (toExpanded) setIsColorExpanded(false); // Close other stack
    };

    const toggleColor = () => {
        const toExpanded = !isColorExpanded;
        LayoutAnimation.configureNext({
            duration: 400,
            create: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
            update: { type: LayoutAnimation.Types.easeInEaseOut },
            delete: { type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity },
        });
        setIsColorExpanded(toExpanded);
        if (toExpanded) setIsFormatExpanded(false); // Close other stack
    };

    const closeAll = () => {
        if (!isFormatExpanded && !isColorExpanded) return;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsFormatExpanded(false);
        setIsColorExpanded(false);
    }

    const ToolbarButton = ({ icon: Icon, action, isActive = false }: { icon: any, action: () => void, isActive?: boolean }) => (
        <TouchableOpacity
            onPress={action}
            style={[styles.iconButton, isActive && styles.activeButton]}
        >
            <Icon size={22} color={isActive ? (isDark ? 'black' : 'black') : iconColor} strokeWidth={2} />
        </TouchableOpacity>
    );

    const anyExpanded = isFormatExpanded || isColorExpanded;

    return (
        <View style={[styles.container, anyExpanded && styles.containerExpanded]} pointerEvents="box-none">

            {/* Overlay to dismiss on tap outside */}
            {anyExpanded && (
                <TouchableWithoutFeedback onPress={closeAll}>
                    <View style={styles.overlay} />
                </TouchableWithoutFeedback>
            )}

            <View style={styles.stacksWrapper} pointerEvents="box-none">
                {/* 1. Color Picker Capsule (Top) */}
                <View style={[styles.capsuleContainer, { marginBottom: 12 }]}>
                    <BlurView
                        intensity={80}
                        tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                        style={[
                            styles.glassCapsule,
                            isColorExpanded ? styles.expandedCapsule : styles.collapsedCapsule,
                            { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }
                        ]}
                    >
                        {!isColorExpanded ? (
                            <TouchableOpacity onPress={toggleColor} style={styles.collapsedButton}>
                                <Palette size={24} color={activeColor} strokeWidth={2} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.expandedContent}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ gap: 8, paddingHorizontal: 4, alignItems: 'center' }}
                                    style={{ flex: 1 }} // Ensure it takes available width to scroll
                                >
                                    {COLORS.map((color) => (
                                        <TouchableOpacity
                                            key={color}
                                            onPress={() => handleColorSelect(color)}
                                            style={[
                                                styles.colorSwatch,
                                                { backgroundColor: color },
                                                selectedColor === color && { borderWidth: 2, borderColor: '#b8e82a', transform: [{ scale: 1.1 }] }
                                            ]}
                                        />
                                    ))}
                                </ScrollView>
                                <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />
                                <TouchableOpacity onPress={toggleColor} style={styles.iconButton}>
                                    <ChevronRight size={20} color={activeColor} />
                                </TouchableOpacity>
                            </View>
                        )}
                    </BlurView>
                </View>

                {/* 2. Format Toolbar Capsule (Bottom) */}
                <View style={[styles.capsuleContainer]}>
                    <BlurView
                        intensity={80}
                        tint={isDark ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                        style={[
                            styles.glassCapsule,
                            isFormatExpanded ? styles.expandedCapsule : styles.collapsedCapsule,
                            { borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }
                        ]}
                    >
                        {!isFormatExpanded ? (
                            <TouchableOpacity onPress={toggleFormat} style={styles.collapsedButton}>
                                <Text style={[styles.textIcon, { color: activeColor }]}>Aa</Text>
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.expandedContent}>
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 4 }}
                                    style={{ flex: 1 }}
                                >
                                    {/* Advanced Format Modal Trigger */}
                                    <TouchableOpacity onPress={onFormatPress} style={[styles.pillBtn, {
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                                    }]}>
                                        <Text style={[styles.textIcon, { color: activeColor, fontSize: 18 }]}>Aa</Text>
                                        <ChevronDown size={14} color={activeColor} style={{ marginLeft: 2 }} />
                                    </TouchableOpacity>

                                    <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                                    <ToolbarButton icon={Bold} action={() => editor.toggleBold()} isActive={editorState.isBoldActive} />
                                    <ToolbarButton icon={Italic} action={() => editor.toggleItalic()} isActive={editorState.isItalicActive} />
                                    <ToolbarButton icon={Underline} action={() => editor.toggleUnderline()} isActive={editorState.isUnderlineActive} />
                                    <ToolbarButton icon={Strikethrough} action={() => editor.toggleStrike()} isActive={editorState.isStrikeActive} />

                                    <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                                    <ToolbarButton icon={List} action={() => editor.toggleBulletList()} isActive={editorState.isBulletListActive} />
                                    <ToolbarButton icon={CheckSquare} action={() => editor.toggleTaskList()} isActive={editorState.isTaskListActive} />

                                    <View style={[styles.separator, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]} />

                                    <TouchableOpacity onPress={toggleFormat} style={styles.iconButton}>
                                        <ChevronRight size={20} color={activeColor} />
                                    </TouchableOpacity>
                                </ScrollView>
                            </View>
                        )}
                    </BlurView>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // Default position logic handled by stacksWrapper, but container now covers screen on expand
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
        zIndex: 100,
        // Default (collapsed) doesn't block hits because pointerEvents="box-none"
    },
    containerExpanded: {
        // When expanded, we still want box-none for container, but overlay handles the blocking
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'transparent', // or 'rgba(0,0,0,0.05)' for debug
        zIndex: 101,
    },
    stacksWrapper: {
        position: 'absolute',
        bottom: 40,
        right: 20,
        alignItems: 'flex-end',
        flexDirection: 'column',
        zIndex: 102, // Above overlay
    },
    capsuleContainer: {
        alignItems: 'flex-end',
    },
    glassCapsule: {
        borderRadius: 100,
        borderWidth: StyleSheet.hairlineWidth,
        overflow: 'hidden',
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
    },
    collapsedCapsule: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedCapsule: {
        height: 50,
        paddingHorizontal: 8,
        maxWidth: 600, // Increased to allow full width on iPad/Larger phones
        width: '100%', // Take up to maxWidth
    },
    collapsedButton: {
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    expandedContent: {
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%',
        flex: 1, // Allow content to fill capsule
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        marginHorizontal: 1,
    },
    pillBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 16,
        marginRight: 4,
    },
    activeButton: {
        backgroundColor: '#b8e82a',
    },
    separator: {
        width: 1,
        height: 16,
        marginHorizontal: 6,
    },
    colorSwatch: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    textIcon: {
        fontSize: 22,
        fontWeight: '600',
        fontFamily: Platform.select({ ios: 'Serif', android: 'serif' }),
    },
});
