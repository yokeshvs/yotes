import { GlassButton } from '@/components/GlassButton';
import { NoteCard } from '@/components/NoteCard';
import { useNotes } from '@/context/NotesContext';
import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { ChevronLeft, Search as SearchIcon, X } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SearchScreen() {
    const router = useRouter();
    const { notes } = useNotes();
    const [searchQuery, setSearchQuery] = useState('');
    const { colorScheme } = useTheme();
    const insets = useSafeAreaInsets();
    const isDark = colorScheme === 'dark';

    // Filter notes based on search
    const filteredNotes = notes.filter(n => {
        if (!searchQuery.trim()) return false;
        return n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <View className="flex-1 bg-[#F2F2F7] dark:bg-black">
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View className="flex-1 px-6" style={{ paddingTop: insets.top }}>
                {/* Header */}

                <View className="flex-row items-center mb-6 pt-2">
                    <GlassButton onPress={() => router.back()}>
                        <ChevronLeft size={24} color={isDark ? 'white' : 'black'} />
                    </GlassButton>
                    <Text className="text-2xl font-bold ml-4 text-gray-900 dark:text-white">Search</Text>
                </View>

                {/* Search Input */}
                <View className="flex-row items-center bg-white dark:bg-zinc-900 rounded-2xl px-4 py-3 shadow-sm mb-6 border border-gray-100 dark:border-zinc-800">
                    <SearchIcon size={20} color="#9ca3af" />
                    <TextInput
                        placeholder="Search notes, tags..."
                        placeholderTextColor="#9ca3af"
                        className="flex-1 ml-3 text-base text-gray-900 dark:text-white h-12"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoFocus
                        autoCapitalize="none"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <X size={18} color="#9ca3af" />
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results */}
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                >
                    {searchQuery.trim() === '' ? (
                        <View className="items-center justify-center mt-20 opacity-50">
                            <SearchIcon size={64} color="#d1d5db" />
                            <Text className="text-gray-400 dark:text-gray-600 mt-4 text-lg">Type to find notes</Text>
                        </View>
                    ) : filteredNotes.length > 0 ? (
                        filteredNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                id={note.id}
                                title={note.title}
                                content={note.content}
                                date={note.date}
                                color={note.color}
                                onPress={() => router.push(`/note/${note.id}`)}
                            />
                        ))
                    ) : (
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-400 dark:text-gray-600 text-lg">No results found</Text>
                        </View>
                    )}
                </ScrollView>

            </View >
        </View >
    );
}
