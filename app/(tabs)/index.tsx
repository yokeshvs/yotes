import { NoteCard } from '@/components/NoteCard';
import { useNotes } from '@/context/NotesContext';
import { BlurView } from 'expo-blur';
import { useNavigation, useRouter } from 'expo-router';
import { Pin, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, LayoutAnimation, Platform, ScrollView, StatusBar, Text, TouchableOpacity, UIManager, useColorScheme, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function NotesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const navigation = useNavigation();
  const { notes, allTags, searchQuery, deleteNotes, togglePin } = useNotes();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const colorScheme = useColorScheme();

  const handleFilterSelect = (tag: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSelectedFilter(tag);
  };


  // Selection Mode State
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Check if all selected notes are pinned
  const allSelectedPinned = React.useMemo(() => {
    if (selectedIds.size === 0) return false;
    // Find all selected note objects
    const selectedNotes = notes.filter(n => selectedIds.has(n.id));
    // Check if EVERY selected note has isPinned === true
    return selectedNotes.every(n => n.isPinned);
  }, [selectedIds, notes]);

  // Filters and Sorting
  const filteredNotes = notes.filter(note => {
    const matchesFilter = selectedFilter === 'All' || (note.tags && note.tags.includes(selectedFilter));
    const matchesSearch = searchQuery === '' ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  }).sort((a, b) => {
    // Sort by Pinned (true first)
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    // Then by Date (assuming date string is comparable, or rely on index/insertion order if date is string display)
    // Actually, date string "DD MMM YYYY" isn't strictly sortable alpha. 
    // Ideally we'd store timestamp. For now, rely on insertion order (reverse) or id (timestamp).
    // Let's just create a timestamp from ID since ID is Date.now()
    return Number(b.id) - Number(a.id);
  });

  const col1 = filteredNotes.filter((_, i) => i % 2 === 0);
  const col2 = filteredNotes.filter((_, i) => i % 2 !== 0);

  // Selection Handlers
  const handleLongPress = (id: string) => {
    setIsSelectionMode(true);
    const newSet = new Set(selectedIds);
    newSet.add(id);
    setSelectedIds(newSet);
  };

  const handlePress = (id: string) => {
    if (isSelectionMode) {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) {
        newSet.delete(id);
        if (newSet.size === 0) setIsSelectionMode(false);
      } else {
        newSet.add(id);
      }
      setSelectedIds(newSet);
    } else {
      router.push(`/note/${id}`);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredNotes.length) {
      setSelectedIds(new Set()); // Deselect all
    } else {
      setSelectedIds(new Set(filteredNotes.map(n => n.id)));
    }
  };

  const cancelSelection = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    Alert.alert(
      "Delete Notes",
      `Are you sure you want to delete ${selectedIds.size} notes?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteNotes(Array.from(selectedIds));
            cancelSelection();
          }
        }
      ]
    );
  };

  const handleBatchPin = () => {
    Array.from(selectedIds).forEach(id => togglePin(id));
    cancelSelection();
  };

  return (
    <View style={{ flex: 1 }} className="bg-[#F2F2F7] dark:bg-black">
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        {/* Restored 'top' edge so content starts below Status Bar and Sticky Header respects top inset */}

        {/* Main ScrollView with Sticky Filters */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          stickyHeaderIndices={[1]} // Index 1 is the Filter View
          contentContainerStyle={{ paddingBottom: 100 }} // Removed manual paddingTop
          keyboardDismissMode="on-drag"
        >

          {/* 0. Logo Header (Scrolls away) */}
          {/* Hidden in selection mode to save space/confusion, or keep it? 
                User wants clean. Let's keep it simple. Only hide if selection mode overlay is active?
                Actually, standard iOS practice: Header stays or scrolls. 
                Let's keep it visible but allow scrolling.
            */}
          <View
            className="items-center justify-center pt-0 pb-0"
            style={{ opacity: isSelectionMode ? 0 : 1, marginBottom: -25, marginTop: -25 }}
          >
            <Image
              source={require('../../assets/header_logo_brand.png')}
              style={{ width: 430, height: 133, resizeMode: 'contain', transform: [{ scale: 1.05 }] }} // Reduced size by ~5%
              className="dark:opacity-80"
            />
          </View>

          {/* 1. Filters (Sticky) */}
          <View
            className="bg-[#F2F2F7] dark:bg-black z-20 pb-2 pt-0"
            style={{ opacity: isSelectionMode ? 0 : 1 }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
            >
              {allTags.map((tag) => {
                const isSelected = selectedFilter === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => handleFilterSelect(tag)}
                    className={`mr-3 px-6 py-3 rounded-full border shadow-sm items-center justify-center min-w-[80px]
                            ${isSelected
                        ? 'bg-[#b8e82a] border-transparent'
                        : 'bg-white border-transparent dark:bg-zinc-800'
                      }
                            `}
                  >
                    <Text
                      className={`font-semibold text-base
                                    ${isSelected
                          ? 'text-black'
                          : 'text-gray-600 dark:text-gray-300'
                        }
                                `}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* 2. Notes Grid */}
          <View className="px-6">
            <View className="flex-row justify-between">
              {/* Column 1 */}
              <View className="w-[48%]">
                {col1.map(note => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    date={note.date}
                    color={note.color}
                    isPinned={note.isPinned}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.has(note.id)}
                    onPress={() => handlePress(note.id)}
                    onLongPress={() => handleLongPress(note.id)}
                  />
                ))}
              </View>

              {/* Column 2 */}
              <View className="w-[48%]">
                {col2.map(note => (
                  <NoteCard
                    key={note.id}
                    id={note.id}
                    title={note.title}
                    content={note.content}
                    date={note.date}
                    color={note.color}
                    isPinned={note.isPinned}
                    isSelectionMode={isSelectionMode}
                    isSelected={selectedIds.has(note.id)}
                    onPress={() => handlePress(note.id)}
                    onLongPress={() => handleLongPress(note.id)}
                  />
                ))}
              </View>
            </View>

            {filteredNotes.length === 0 && (
              <View className="mt-10 items-center">
                <Text className="text-gray-400">No notes found.</Text>
              </View>
            )}
          </View>

        </ScrollView>

        {/* Selection Header Overlay */}
        {isSelectionMode && (
          <View className="absolute left-0 right-0 z-50 px-6 pt-2" style={{ top: insets.top }}>
            <BlurView
              intensity={80}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              className="flex-row justify-between items-center px-6 py-4 rounded-full overflow-hidden shadow-sm bg-white/60 dark:bg-zinc-800/60"
            >
              <TouchableOpacity onPress={cancelSelection} hitSlop={10}>
                <Text className="text-base font-semibold text-red-500 dark:text-red-400">Cancel</Text>
              </TouchableOpacity>

              <Text className="text-lg font-bold dark:text-white">
                {selectedIds.size} Selected
              </Text>

              <TouchableOpacity onPress={handleSelectAll} hitSlop={10}>
                <Text className="text-base font-bold text-[#b8e82a]">
                  {selectedIds.size === filteredNotes.length ? 'Deselect' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </BlurView>
          </View>
        )}

        {/* Floating Bottom Action Bar for Selection Mode */}
        {isSelectionMode && (
          <View className="absolute left-0 right-0 items-center z-50" style={{ bottom: insets.bottom + 60 }}>
            <BlurView
              intensity={80}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              className="flex-row items-center justify-center px-8 py-4 rounded-full overflow-hidden shadow-2xl bg-white/50 dark:bg-zinc-900/50"
            >
              {selectedIds.size === 1 && (
                <>
                  <TouchableOpacity onPress={handleBatchPin} className="items-center justify-center w-12 h-12 rounded-full mr-8 active:bg-gray-200/50 dark:active:bg-gray-700/50">
                    <Pin
                      size={28}
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                      fill={allSelectedPinned ? (colorScheme === 'dark' ? 'white' : 'black') : 'none'}
                    />
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={handleBatchDelete} className="items-center justify-center w-12 h-12 rounded-full active:bg-red-500/20">
                <Trash2 size={28} color="#ef4444" />
              </TouchableOpacity>
            </BlurView>
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}
