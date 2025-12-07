import { useNotes } from '@/context/NotesContext';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  const router = useRouter();
  const { notes, allTags, searchQuery } = useNotes();
  const [selectedFilter, setSelectedFilter] = useState('#All');

  const filteredNotes = notes.filter(note => {
    const matchesFilter = selectedFilter === '#All' || (note.tags && note.tags.includes(selectedFilter));
    const matchesSearch = searchQuery === '' || 
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const col1 = filteredNotes.filter((_, i) => i % 2 === 0);
  const col2 = filteredNotes.filter((_, i) => i % 2 !== 0);

  return (
    <View className="flex-1 bg-[#F2F2F7]">
      <StatusBar barStyle="dark-content" />

      {/* Main Content */}
      <View style={{ flex: 1 }}>
        <SafeAreaView className="flex-1 px-6" edges={['top', 'left', 'right']}>
          {/* Header */}
          <View className="flex-row justify-center items-center mb-0 pt-0">
            <View className="items-center justify-center">
              <Image
                source={require('../../assets/header_logo_small_fixed.png')}
                style={{ width: 360, height: 100, resizeMode: 'contain' }}
              />
            </View>
          </View>

          {/* Filters */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 flex-grow-0"
            contentContainerStyle={{ paddingHorizontal: 4, paddingVertical: 15 }}
          >
            {allTags.map((tag) => {
              const isSelected = selectedFilter === tag;
              return (
                <TouchableOpacity
                  key={tag}
                  onPress={() => setSelectedFilter(tag)}
                  style={{ backgroundColor: isSelected ? '#a3e635' : 'rgba(255,255,255,0.8)' }}
                  className={`mr-3 px-6 py-3 rounded-full border ${isSelected ? 'border-transparent' : 'border-white'} shadow-sm items-center justify-center min-w-[80px]`}
                >
                  <Text className={`font-semibold text-base ${isSelected ? 'text-black' : 'text-gray-600'}`}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Staggered Grid */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }} // Space for TabBar
            keyboardDismissMode="on-drag"
          >
            <View className="flex-row justify-between">
              {/* Column 1 */}
              <View className="w-[48%]">
                {col1.map(note => (
                  <NoteCard
                    key={note.id}
                    title={note.title}
                    content={note.content}
                    date={note.date}
                    color={note.color}
                    height={note.content.length > 50 ? 220 : 160}
                    onPress={() => router.push(`/note/${note.id}`)}
                  />
                ))}
              </View>

              {/* Column 2 */}
              <View className="w-[48%]">
                {col2.map(note => (
                  <NoteCard
                    key={note.id}
                    title={note.title}
                    content={note.content}
                    date={note.date}
                    color={note.color}
                    height={note.content.length > 80 ? 240 : 180}
                    onPress={() => router.push(`/note/${note.id}`)}
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
        </SafeAreaView>

      </View>
    </View>
  );
}

function NoteCard({ title, content, date, color, height, onPress }: { title: string, content: string, date: string, color: string, height: number, onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="p-5 rounded-[24px] border border-white/40 shadow-sm mb-5 overflow-hidden relative"
      style={{ minHeight: height, backgroundColor: color }}
    >
      <View className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10" />
      <Text className="text-gray-900 font-bold text-lg mb-2 leading-6">{title}</Text>
      <Text className="text-gray-800/80 text-sm leading-5 mb-auto" numberOfLines={6}>{content}</Text>
      {date && <Text className="text-gray-500/80 text-[10px] uppercase font-bold tracking-wider mt-4">{date}</Text>}
    </TouchableOpacity>
  );
}
