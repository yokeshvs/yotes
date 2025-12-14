import { NoteCard } from '@/components/NoteCard';
import { useNotes } from '@/context/NotesContext';
import { BlurView } from 'expo-blur';
import { useNavigation, useRouter } from 'expo-router';
import { Pin, Trash2 } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  const router = useRouter();
  const navigation = useNavigation(); // Add navigation hook
  const { notes, allTags, searchQuery, deleteNotes, togglePin } = useNotes();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const colorScheme = useColorScheme();

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
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 24 }} edges={['top', 'left', 'right']}>

        {/* Header Container - Preserves Height */}
        <View className="relative z-10">

          {/* Normal Header Content - Always Rendered for Spacer, Hidden visually in Selection Mode */}
          <View
            style={{ opacity: isSelectionMode ? 0 : 1 }}
            pointerEvents={isSelectionMode ? 'none' : 'auto'}
          >
            <View className="flex-row justify-center items-center mt-2" style={{ marginBottom: 0 }}>
              <View className="items-center justify-center">
                <Image
                  source={require('../../assets/header_logo_brand.png')}
                  style={{ width: 432, height: 120, resizeMode: 'contain', opacity: 1 }}
                  className="dark:opacity-80" // Slight dim in dark mode
                />
              </View>
            </View>

            {/* Filters */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="mb-4 flex-grow-0"
              contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 15, paddingTop: 0 }}
            >
              {allTags.map((tag) => {
                const isSelected = selectedFilter === tag;
                return (
                  <TouchableOpacity
                    key={tag}
                    onPress={() => setSelectedFilter(tag)}
                    className={`mr-3 px-6 py-3 rounded-full border shadow-sm items-center justify-center min-w-[80px]
                        ${isSelected
                        ? 'bg-[#b8e82a] border-transparent'
                        : 'bg-white/80 border-white dark:bg-zinc-800 dark:border-zinc-700'
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

          {/* Selection Header - Absolute Overlay */}
          {isSelectionMode && (
            <View className="absolute inset-0 justify-center px-2">
              {/* Centered vertically in the header space */}
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
        </View>

        {/* Staggered Grid */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 180 }} // Extra space for floating bar
          keyboardDismissMode="on-drag"
        >
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
        </ScrollView>

        {/* Floating Glass Action Bar for Selection Mode */}
        {isSelectionMode && (
          // Center the pill at the bottom - Break out of padding with negative margins
          <View className="absolute bottom-24 items-center" style={{ left: -24, right: -24 }}>
            <BlurView
              intensity={80}
              tint={colorScheme === 'dark' ? 'dark' : 'light'}
              className="flex-row items-center justify-center px-8 py-4 rounded-full overflow-hidden shadow-2xl bg-white/50 dark:bg-zinc-900/50"
              style={{ gap: 0 }} // Remove gap style, assume manual spacing
            >

              {/* Only show Pin/Unpin if exactly 1 note is selected */}
              {selectedIds.size === 1 && (
                <>
                  <TouchableOpacity onPress={handleBatchPin} className="items-center justify-center w-12 h-12 rounded-full active:bg-gray-200/50 dark:active:bg-gray-700/50">
                    <Pin
                      size={28}
                      color={colorScheme === 'dark' ? 'white' : 'black'}
                      fill={allSelectedPinned ? (colorScheme === 'dark' ? 'white' : 'black') : 'none'}
                    />
                  </TouchableOpacity>
                  {/* Explicit Spacer for consistent centering */}
                  <View className="w-8" />
                </>
              )}

              {/* Delete Button - Always visible */}
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
