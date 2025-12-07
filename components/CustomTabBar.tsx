import { BlurView } from 'expo-blur';
import { useNotes } from '@/context/NotesContext';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useRouter } from 'expo-router';
import { Calendar, Home, Plus, Search, Settings, X } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Keyboard, LayoutAnimation, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { searchQuery, setSearchQuery } = useNotes();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [isSearchActive, setIsSearchActive] = useState(false);
    const inputRef = useRef<TextInput>(null);

    const toggleSearch = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        if (isSearchActive) {
            setIsSearchActive(false);
            setSearchQuery('');
            Keyboard.dismiss();
        } else {
            setIsSearchActive(true);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    const handleTabPress = (routeName: string, routeKey: string) => {
        const event = navigation.emit({
            type: 'tabPress',
            target: routeKey,
            canPreventDefault: true,
        });

        if (!event.defaultPrevented) {
            navigation.navigate(routeName);
        }
    };

    const getIcon = (routeName: string, isFocused: boolean) => {
        const iconSize = 22;
        const strokeWidth = isFocused ? 2.5 : 2;
        const iconColor = isDark ? '#ffffff' : '#111827';

        switch (routeName) {
            case 'index':
                return <Home size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            case 'timeline':
                return <Calendar size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            case 'settings':
                return <Settings size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
            default:
                return <Home size={iconSize} color={iconColor} strokeWidth={strokeWidth} />;
        }
    };

    const blurTint = isDark ? 'dark' : 'light';
    const iconColor = isDark ? '#ffffff' : '#111827';
    const placeholderColor = isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';

    return (
        <View style={[styles.container, { paddingBottom: insets.bottom + 10 }]} pointerEvents="box-none">
            <View style={styles.rowContainer} pointerEvents="box-none">
                {/* Main Navigation Pill */}
                <View style={[styles.glassPill, isSearchActive ? styles.collapsedPill : styles.expandedPill]}>
                    <BlurView intensity={80} tint={blurTint} style={StyleSheet.absoluteFill} />
                    <View style={styles.glassOverlay} />
                    
                    {isSearchActive ? (
                        <TouchableOpacity 
                            onPress={toggleSearch} 
                            style={styles.centerContent}
                            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        >
                            <X size={24} color={iconColor} />
                        </TouchableOpacity>
                    ) : (
                        <View style={styles.tabsContainer}>
                            {state.routes.map((route, index) => {
                                const isFocused = state.index === index;
                                
                                return (
                                    <React.Fragment key={route.key}>
                                        <TouchableOpacity
                                            onPress={() => handleTabPress(route.name, route.key)}
                                            style={styles.tabButton}
                                            activeOpacity={0.7}
                                        >
                                            <View style={[styles.iconContainer, isFocused && styles.iconContainerActive]}>
                                                {getIcon(route.name, isFocused)}
                                            </View>
                                            {isFocused && <View style={[styles.activeDot, { backgroundColor: iconColor }]} />}
                                        </TouchableOpacity>

                                        {index === 1 && (
                                            <TouchableOpacity
                                                onPress={() => router.push('/new-note')}
                                                style={styles.addButton}
                                                activeOpacity={0.8}
                                            >
                                                <View style={styles.addButtonInner}>
                                                    <Plus size={22} color="#000" strokeWidth={3} />
                                                </View>
                                            </TouchableOpacity>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* Search Pill */}
                <View style={[styles.glassPill, isSearchActive ? styles.expandedPill : styles.collapsedPill]}>
                    <BlurView intensity={80} tint={blurTint} style={StyleSheet.absoluteFill} />
                    <View style={styles.glassOverlay} />
                    
                    {isSearchActive ? (
                        <View style={styles.searchContainer}>
                            <Search size={18} color={iconColor} style={{ marginRight: 8 }} />
                            <TextInput
                                ref={inputRef}
                                style={[styles.searchInput, { color: iconColor }]}
                                placeholder="Search notes..."
                                placeholderTextColor={placeholderColor}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoCorrect={false}
                                autoCapitalize="none"
                            />
                        </View>
                    ) : (
                        <TouchableOpacity 
                            onPress={toggleSearch} 
                            style={styles.centerContent}
                            activeOpacity={0.7}
                        >
                            <Search size={22} color={iconColor} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        pointerEvents: 'box-none',
        zIndex: 1000,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 20,
        width: '100%',
        maxWidth: 500,
        pointerEvents: 'box-none',
    },
    glassPill: {
        height: 60,
        borderRadius: 30,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 20,
        shadowOffset: { width: 0, height: 8 },
        elevation: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.18)',
    },
    glassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    expandedPill: {
        flex: 1,
    },
    collapsedPill: {
        width: 60,
    },
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    tabsContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
    },
    tabButton: {
        flex: 1,
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    iconContainer: {
        opacity: 0.6,
        transform: [{ scale: 1 }],
    },
    iconContainerActive: {
        opacity: 1,
        transform: [{ scale: 1.15 }],
    },
    activeDot: {
        position: 'absolute',
        bottom: 8,
        width: 4,
        height: 4,
        borderRadius: 2,
    },
    addButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    addButtonInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#a3e635',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#a3e635',
        shadowOpacity: 0.4,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    searchContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: '100%',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        height: '100%',
        paddingVertical: 0,
        textAlignVertical: 'center',
        includeFontPadding: false,
    },
});
