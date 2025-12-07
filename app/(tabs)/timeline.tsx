import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNotes } from '../../context/NotesContext';

export default function TimelineScreen() {
    const { notes } = useNotes();
    const today = new Date();
    const [selectedDateStr, setSelectedDateStr] = useState(today.toDateString());

    const dates = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - 3 + i);
        return {
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNum: d.getDate(),
            fullDateStr: d.toDateString(),
            fullDateObj: d
        };
    });

    const timelineData = notes
        .filter(note => {
            const noteTimestamp = parseInt(note.id);
            if (!isNaN(noteTimestamp) && noteTimestamp > 0) {
                const noteDate = new Date(noteTimestamp);
                return noteDate.toDateString() === selectedDateStr;
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

    const currentDisplayDate = new Date(selectedDateStr);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.timeText}>9:41</Text>
                    <View style={styles.cameraNotch}>
                        <View style={styles.notchInner} />
                    </View>
                </View>

                {/* Title & Month */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleText}>Timeline</Text>
                    <View style={styles.monthPill}>
                        <Text style={styles.monthText}>
                            {currentDisplayDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </Text>
                    </View>
                </View>

                {/* Calendar Strip */}
                <View style={styles.stripContainer}>
                    {dates.map((item) => {
                        const isSelected = item.fullDateStr === selectedDateStr;
                        return (
                            <TouchableOpacity
                                key={item.fullDateStr}
                                onPress={() => setSelectedDateStr(item.fullDateStr)}
                                style={[
                                    styles.dateButton,
                                    isSelected ? styles.dateButtonSelected : styles.dateButtonInactive
                                ]}
                            >
                                <Text style={[styles.dayName, isSelected && styles.textSelected]}>{item.dayName}</Text>
                                <Text style={[styles.dayNum, isSelected && styles.textSelected]}>{item.dayNum}</Text>
                                {isSelected && <View style={styles.dot} />}
                            </TouchableOpacity>
                        )
                    })}
                </View>

                {/* Schedule Title */}
                <Text style={styles.scheduleTitle}>
                    {selectedDateStr === today.toDateString() ? "Today's Schedule" : `${currentDisplayDate.toLocaleDateString('en-US', { weekday: 'long' })}'s Schedule`}
                </Text>

                {/* Timeline List (ScrollView) */}
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 180 }}>
                    <View style={styles.listContainer}>
                        {/* Vertical Line */}
                        <View style={styles.verticalLine} />

                        {timelineData.length > 0 ? (
                            timelineData.map(item => (
                                <View key={item.id} style={styles.eventRow}>
                                    <View style={styles.timeColumn} />
                                    <View style={styles.timelineDot} />
                                    <View style={[styles.eventCard, { backgroundColor: item.color || '#fff' }]}>
                                        <View style={styles.eventHeader}>
                                            <Text style={styles.eventTitle} numberOfLines={1}>{item.title}</Text>
                                            <View style={styles.timeTag}>
                                                <Text style={styles.timeTagText}>{item.time}</Text>
                                            </View>
                                        </View>
                                        <Text style={styles.eventContent} numberOfLines={4}>{item.content}</Text>
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={[styles.eventRow, { opacity: 0.7 }]}>
                                <View style={styles.timeColumn} />
                                <View style={[styles.timelineDot, { backgroundColor: '#d1d5db' }]} />
                                <View style={styles.emptyCard}>
                                    <Text style={styles.emptyText}>No notes for this day</Text>
                                </View>
                            </View>
                        )}

                        <View style={[styles.eventRow, { opacity: 0.5 }]}>
                            <View style={styles.timeColumn} />
                            <View style={[styles.timelineDot, { backgroundColor: '#d1d5db' }]} />
                            <View style={styles.emptyCard}>
                                <Text style={styles.endText}>End of timeline</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>

            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F7',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
        paddingTop: 8,
    },
    timeText: {
        color: '#6b7280',
        fontSize: 14,
    },
    cameraNotch: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#d1d5db',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.5)',
    },
    notchInner: {
        width: 16,
        height: 8,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#9ca3af',
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    titleText: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#111827',
    },
    monthPill: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        alignItems: 'center',
    },
    monthText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
    },
    stripContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    dateButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 44,
        height: 80,
        borderRadius: 16,
        borderWidth: 1,
    },
    dateButtonSelected: {
        backgroundColor: '#a3e635',
        borderColor: '#a3e635',
        shadowColor: '#a3e635',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    dateButtonInactive: {
        backgroundColor: 'rgba(255,255,255,0.4)',
        borderColor: 'rgba(255,255,255,0.6)',
    },
    dayName: {
        fontSize: 12,
        marginBottom: 8,
        color: '#6b7280',
    },
    dayNum: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    textSelected: {
        color: '#000',
    },
    dot: {
        width: 4,
        height: 4,
        backgroundColor: '#000',
        borderRadius: 2,
        marginTop: 4,
    },
    scheduleTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
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
        backgroundColor: 'rgba(229,231,235,0.8)',
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
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#9ca3af',
        zIndex: 10,
    },
    eventCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.6)',
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
        color: '#111827',
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
        color: '#374151',
        fontSize: 14,
    },
    emptyCard: {
        flex: 1,
        padding: 20,
        borderRadius: 24,
        borderWidth: 2,
        borderColor: '#d1d5db',
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: '#6b7280',
        fontWeight: '500',
    },
    endText: {
        color: '#9ca3af',
        fontWeight: '500',
    }
});
