import { useTheme } from '@/context/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotes } from '../../context/NotesContext';

export default function TimelineScreen() {
    const { notes } = useNotes();
    const { colorScheme } = useTheme();
    const isDark = colorScheme === 'dark';

    const today = useMemo(() => new Date(), []);
    const [selectedDate, setSelectedDate] = useState(today);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const insets = useSafeAreaInsets();
    const router = useRouter();
    const flatListRef = useRef<FlatList>(null);

    // Generate a stable date range centered around TODAY
    // 60 days total: 30 before, 29 after
    const dates = useMemo(() => {
        return Array.from({ length: 60 }, (_, i) => {
            const d = new Date(today);
            d.setDate(today.getDate() - 30 + i);
            return {
                dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
                dayNum: d.getDate(),
                fullDateStr: d.toDateString(),
                fullDateObj: d
            };
        });
    }, [today]);

    const handleDateSelect = (date: Date) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedDate(date);
    };

    // Scroll to the selected date when the component mounts or dates change
    useEffect(() => {
        const selectedIndex = dates.findIndex(d => d.fullDateStr === selectedDate.toDateString());
        if (selectedIndex !== -1) {
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: selectedIndex, animated: true, viewPosition: 0.5 });
            }, 100);
        }
    }, [dates, selectedDate]);

    // Enable LayoutAnimation for Android
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }

    const onDateChange = (event: any, date?: Date) => {
        if (Platform.OS === 'android') {
            setShowDatePicker(false);
            if (date) {
                handleDateSelect(date);
            }
        }
    };

    const timelineData = notes
        .filter(note => {
            const noteTimestamp = parseInt(note.id);
            if (!isNaN(noteTimestamp) && noteTimestamp > 0) {
                const noteDate = new Date(noteTimestamp);
                return noteDate.toDateString() === selectedDate.toDateString();
            }
            return false;
        })
        .sort((a, b) => parseInt(b.id) - parseInt(a.id))
        .map(note => {
            const timestamp = parseInt(note.id);
            const dateObj = new Date(timestamp);
            return {
                id: note.id,
                time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                title: note.title,
                color: note.color,
                content: note.content
            };
        });

    return (
        <View style={styles.container} className="bg-[#F5F5F7] dark:bg-black">
            {/* Main Content Layer */}
            <View style={{ flex: 1, paddingTop: insets.top, paddingHorizontal: 24, zIndex: 1 }}>

                {/* Header Title */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText} className="text-gray-900 dark:text-white">Timeline</Text>
                </View>

                {/* Scrollable Calendar Strip */}
                <View style={styles.stripContainer}>
                    <FlatList
                        ref={flatListRef}
                        data={dates}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={{ paddingRight: 24 }}
                        keyExtractor={(item) => item.fullDateStr}
                        initialScrollIndex={30} // Center on Today (index 30 of 60)
                        getItemLayout={(data, index) => (
                            { length: 60, offset: 60 * index, index }
                        )}
                        onScrollToIndexFailed={info => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
                            });
                        }}
                        renderItem={({ item }) => {
                            const isSelected = item.fullDateStr === selectedDate.toDateString();

                            // Get colors of notes for this day
                            const dayNoteColors = notes
                                .filter(note => {
                                    const noteTimestamp = parseInt(note.id);
                                    if (!isNaN(noteTimestamp)) {
                                        const d = new Date(noteTimestamp);
                                        return d.toDateString() === item.fullDateStr;
                                    }
                                    return false;
                                })
                                .map(n => n.color)
                                .filter((c, i, arr) => arr.indexOf(c) === i) // Unique colors
                                .slice(0, 3); // Limit to 3 dots

                            return (
                                <TouchableOpacity
                                    onPress={() => handleDateSelect(item.fullDateObj)}
                                    style={{ marginRight: 10 }}
                                    activeOpacity={0.7}
                                >
                                    {isSelected ? (
                                        // Selected: Vibrant Liquid Pill
                                        <View
                                            style={[
                                                styles.dateButton,
                                                {
                                                    backgroundColor: '#b8e82a',
                                                    shadowColor: '#b8e82a',
                                                    shadowOffset: { width: 0, height: 4 },
                                                    shadowOpacity: 0.3,
                                                    shadowRadius: 8,
                                                    elevation: 6
                                                }
                                            ]}
                                        >
                                            <Text style={[styles.dayName, { color: 'black', fontWeight: '600' }]}>{item.dayName}</Text>
                                            <Text style={[styles.dayNum, { color: 'black', fontWeight: 'bold', fontSize: 22 }]}>{item.dayNum}</Text>

                                            {/* Colored Note Indicators */}
                                            <View className="absolute bottom-2 flex-row gap-1">
                                                {dayNoteColors.map((color, index) => (
                                                    <View
                                                        key={index}
                                                        style={{ backgroundColor: 'black' }}
                                                        className={`w-1.5 h-1.5 rounded-full ${color === '#ffffff' ? 'border border-gray-300' : ''}`}
                                                    />
                                                ))}
                                            </View>
                                        </View>
                                    ) : (
                                        // Unselected: consistent Liquid Glass Look
                                        <BlurView
                                            intensity={80} // Increased for stronger glass effect
                                            tint={colorScheme === 'dark' ? 'dark' : 'light'}
                                            style={[
                                                styles.dateButton,
                                                {
                                                    overflow: 'hidden',
                                                    backgroundColor: isDark ? 'rgba(39, 39, 42, 0.3)' : 'rgba(255, 255, 255, 0.3)',
                                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)',
                                                    borderWidth: 1
                                                }
                                            ]}
                                        >
                                            <Text style={styles.dayName} className="text-gray-500 dark:text-gray-400">{item.dayName}</Text>
                                            <Text style={styles.dayNum} className="text-gray-900 dark:text-white font-bold">{item.dayNum}</Text>

                                            {/* Colored Note Indicators */}
                                            <View className="absolute bottom-2 flex-row gap-1">
                                                {dayNoteColors.map((color, index) => (
                                                    <View
                                                        key={index}
                                                        style={{ backgroundColor: color }}
                                                        className={`w-1.5 h-1.5 rounded-full ${color === '#ffffff' ? 'border border-gray-300 dark:border-zinc-600' : ''}`}
                                                    />
                                                ))}
                                            </View>
                                        </BlurView>
                                    )}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>

                <Text style={styles.scheduleTitle} className="text-gray-900 dark:text-white">
                    {selectedDate.toDateString() === today.toDateString() ? "Today's Timeline" : `${selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Timeline`}
                </Text>

                {/* Timeline List (ScrollView) */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                    <View style={styles.listContainer}>
                        {/* Vertical Line */}
                        <View style={styles.verticalLine} className="bg-gray-200 dark:bg-zinc-800" />

                        {timelineData.length > 0 ? (
                            timelineData.map(item => {
                                // Adaptive color logic for events (same as NoteCard)
                                const isDefaultWhite = item.color === '#ffffff' || item.color === '#fff';
                                const itemBg = (isDark && isDefaultWhite) ? '#18181b' : item.color;
                                const itemTextColor = (isDark && isDefaultWhite) ? '#ffffff' : '#111827';
                                const itemContentColor = (isDark && isDefaultWhite) ? '#9ca3af' : '#374151';
                                const itemBorderColor = (isDark && isDefaultWhite) ? '#27272a' : 'transparent';

                                return (
                                    <View key={item.id} style={styles.eventRow}>
                                        <View style={styles.timeColumn} />
                                        <View style={[styles.timelineDot, { borderColor: item.color || '#9ca3af' }]} className="bg-white dark:bg-zinc-900" />
                                        <TouchableOpacity
                                            style={[
                                                styles.eventCard,
                                                {
                                                    backgroundColor: itemBg,
                                                    borderColor: itemBorderColor,
                                                    borderWidth: isDark ? 1 : 0
                                                }
                                            ]}
                                            onPress={() => router.push(`/note/${item.id}`)}
                                            activeOpacity={0.8}
                                        >
                                            <View style={styles.eventHeader}>
                                                <Text style={[styles.eventTitle, { color: itemTextColor }]} numberOfLines={1}>{item.title}</Text>
                                                <View style={styles.timeTag}>
                                                    <Text style={styles.timeTagText}>{item.time}</Text>
                                                </View>
                                            </View>
                                            <Text style={[styles.eventContent, { color: itemContentColor }]} numberOfLines={4}>{item.content.replace(/<[^>]+>/g, '')}</Text>
                                        </TouchableOpacity>
                                    </View>
                                );
                            })
                        ) : (
                            <View style={[styles.eventRow, { opacity: 0.7 }]}>
                                <View style={styles.timeColumn} />
                                <View style={[styles.timelineDot]} className="bg-gray-300 dark:bg-zinc-700" />
                                <View style={styles.emptyCard} className="border-gray-300 dark:border-zinc-700">
                                    <Text style={styles.emptyText} className="text-gray-500 dark:text-gray-400">No notes for this day</Text>
                                </View>
                            </View>
                        )}

                        <View style={[styles.eventRow, { opacity: 0.5 }]}>
                            <View style={styles.timeColumn} />
                            <View style={[styles.timelineDot]} className="bg-gray-300 dark:bg-zinc-700" />
                            <View style={styles.emptyCard} className="border-gray-300 dark:border-zinc-700">
                                <Text style={styles.endText} className="text-gray-400 dark:text-gray-500">End of timeline</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

            </View>

            {/* --- SEPARATE LAYERS (Root Level) --- */}

            {/* 1. Backdrop Overlay (Below Capsule, Above Content) */}
            {showDatePicker && (
                <TouchableOpacity
                    style={[StyleSheet.absoluteFill, { zIndex: 50, backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.1)' }]}
                    activeOpacity={1}
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        setShowDatePicker(false);
                    }}
                >
                    {/* Add blur to backdrop for "Focus" effect */}
                    <BlurView intensity={10} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
                </TouchableOpacity>
            )}

            {/* 2. Floating "Hanging" Capsule (Top Right) */}
            <View
                style={{
                    position: 'absolute',
                    top: insets.top + 10,
                    right: 24,
                    zIndex: 100,
                    alignItems: 'flex-end',
                    // Ensure shadow isn't clipped
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 4,
                }}
                pointerEvents="box-none" // Allow touches to pass through empty space if needed (though View wraps content)
            >
                <TouchableOpacity
                    onPress={() => {
                        LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                        setShowDatePicker(!showDatePicker);
                    }}
                    activeOpacity={0.9}
                    style={{ borderRadius: 24 }} // Match inner border radius for shadow path
                >
                    <BlurView
                        intensity={95} // High intensity for solid glass feel
                        tint={colorScheme === 'dark' ? 'systemChromeMaterialDark' : 'systemChromeMaterialLight'}
                        style={{
                            overflow: 'hidden',
                            borderRadius: 24,
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
                            borderWidth: 1,
                        }}
                    >
                        {/* Header / Collapsed State */}
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            justifyContent: 'space-between',
                            minWidth: showDatePicker ? 320 : 'auto'
                        }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Text style={{
                                    fontSize: 14,
                                    fontWeight: '600',
                                    color: isDark ? 'white' : 'black',
                                    fontVariant: ['tabular-nums']
                                }}>
                                    {selectedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </Text>
                            </View>

                            {showDatePicker && (
                                <TouchableOpacity onPress={() => {
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
                                    setShowDatePicker(false);
                                }}>
                                    <Text style={{ color: '#b8e82a', fontWeight: 'bold' }}>Done</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* Expanded Content */}
                        {showDatePicker && (
                            <View style={{ padding: 10 }}>
                                {Platform.OS === 'ios' ? (
                                    <DateTimePicker
                                        value={selectedDate}
                                        mode="date"
                                        display="inline"
                                        onChange={(e, d) => {
                                            if (d) handleDateSelect(d);
                                        }}
                                        themeVariant={isDark ? 'dark' : 'light'}
                                        accentColor="#b8e82a"
                                        style={{ height: 320 }}
                                    />
                                ) : (
                                    <View style={{ padding: 20, alignItems: 'center' }}>
                                        <Text style={{ color: isDark ? 'white' : 'black' }}>Tap to open calendar</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </BlurView>
                </TouchableOpacity>
            </View>

            {/* Android Trigger Hook */}
            {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // backgroundColor handled by className
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
    },
    titleText: {
        fontSize: 30,
        fontWeight: 'bold',
        // color handled by className
    },
    monthPill: {
        // backgroundColor handled by className
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        // borderColor handled by className
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthText: {
        fontSize: 12,
        fontWeight: 'bold',
        // color handled by className
    },
    stripContainer: {
        marginBottom: 32,
        height: 85,
    },
    dateButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 80,
        borderRadius: 16,
        // borderWidth removed for glass look
        // marginRight removed, handled by parent
    },
    // dateButtonSelected/Inactive removed or handled inline if needed, but keeping for shape/shadow logic if not colored
    // Actually dateButtonSelected has colors. Let's rely on inline className for colors.

    dayName: {
        fontSize: 12,
        marginBottom: 8,
        // color handled by className
    },
    dayNum: {
        fontSize: 20,
        fontWeight: 'bold',
        // color handled by className
    },
    dot: {
        width: 4,
        height: 4,
        // backgroundColor handled by className
        borderRadius: 2,
        marginTop: 4,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: '600',
        // color handled by className
        marginBottom: 16,
    },
    listContainer: {
        position: 'relative',
        paddingLeft: 16,
    },
    verticalLine: {
        position: 'absolute',
        left: 29,
        top: 16,
        bottom: 0,
        width: 2,
        // backgroundColor handled by className
    },
    eventRow: {
        flexDirection: 'row',
        marginBottom: 24,
        position: 'relative',
    },
    timeColumn: {
        marginRight: 32,
        alignItems: 'flex-end',
        width: 64,
        paddingTop: 12,
    },
    timelineDot: {
        position: 'absolute',
        left: 24,
        top: 24,
        width: 12,
        height: 12,
        borderRadius: 6,
        // backgroundColor handled by className
        borderWidth: 2,
        // borderColor handled by className/inline
        zIndex: 10,
    },
    eventCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        // borderWidth/Color handled inline
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    eventHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    eventTitle: {
        fontWeight: 'bold',
        // color handled inline
        fontSize: 18,
        flex: 1,
        marginRight: 8,
    },
    timeTag: {
        backgroundColor: 'rgba(255,255,255,0.4)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    timeTagText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#374151',
    },
    eventContent: {
        // color handled inline
        fontSize: 14,
    },
    emptyCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        // borderColor handled by className
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        // color handled by className
        fontWeight: '500',
    },
    endText: {
        // color handled by className
        fontWeight: '500',
    }
});
