import { GlassButton } from '@/components/GlassButton';
import { useNotes } from '@/context/NotesContext';
import { useTheme } from '@/context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Moon, Smartphone, Sun, Trash2 } from 'lucide-react-native';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const { clearAllNotes } = useNotes();

    return (
        <View className="flex-1 bg-[#F2F2F7] dark:bg-black">
            <SafeAreaView className="flex-1">

                {/* Header */}
                <View className="flex-row items-center px-6 py-4">
                    <GlassButton onPress={() => router.back()}>
                        <ArrowLeft size={24} color={theme === 'dark' ? 'white' : 'black'} />
                    </GlassButton>
                    <Text className="text-xl font-bold ml-4 text-gray-900 dark:text-white">Settings</Text>
                </View>

                <ScrollView className="px-6 mt-4">
                    <Text className="text-gray-500 dark:text-gray-400 font-medium mb-3 uppercase text-xs tracking-wider">Appearance</Text>

                    <View className="bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-sm">
                        <TouchableOpacity
                            onPress={() => setTheme('light')}
                            className="flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-800"
                        >
                            <View className="w-8 h-8 items-center justify-center bg-gray-100 dark:bg-zinc-800 rounded-full mr-3">
                                <Sun size={18} color={theme === 'dark' ? 'white' : 'black'} />
                            </View>
                            <Text className="text-base font-medium flex-1 text-black dark:text-white">Light Mode</Text>
                            {theme === 'light' && <Check size={20} color="#b8e82a" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setTheme('dark')}
                            className="flex-row items-center p-4 border-b border-gray-100 dark:border-zinc-800"
                        >
                            <View className="w-8 h-8 items-center justify-center bg-gray-900 dark:bg-zinc-700 rounded-full mr-3">
                                <Moon size={18} color="white" />
                            </View>
                            <Text className="text-base font-medium flex-1 text-black dark:text-white">Dark Mode</Text>
                            {theme === 'dark' && <Check size={20} color="#b8e82a" />}
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setTheme('system')}
                            className="flex-row items-center p-4"
                        >
                            <View className="w-8 h-8 items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full mr-3">
                                <Smartphone size={18} color="#2563eb" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-black dark:text-white">System (Auto)</Text>
                                <Text className="text-gray-400 text-xs">Default</Text>
                            </View>
                            {theme === 'system' && <Check size={20} color="#b8e82a" />}
                        </TouchableOpacity>
                    </View>

                    <Text className="text-gray-400 text-xs mt-3 px-2">
                        System mode automatically matches your device's Dark/Light settings.
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Reset All Data",
                                "This will permanently delete all notes and reset the app. Are you sure?",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    {
                                        text: "Reset",
                                        style: "destructive",
                                        onPress: async () => {
                                            try {
                                                await AsyncStorage.removeItem('hasOnboarded');
                                                clearAllNotes(); // Clears savedNotes
                                                router.replace('/welcome');
                                            } catch (e) {
                                                console.error('Reset failed', e);
                                            }
                                        }
                                    }
                                ]
                            );
                        }}
                        className="mt-10 rounded-2xl overflow-hidden"
                    >
                        <BlurView
                            intensity={80}
                            tint="light" // Using light tint for danger button to keep it clean, or adapt?
                            // Let's use adaptive but with red background emphasis
                            className="p-4 flex-row items-center justify-center bg-red-50/50 dark:bg-red-900/20"
                        >
                            <Trash2 size={20} color="#ef4444" style={{ marginRight: 8 }} />
                            <Text className="text-red-500 font-bold text-base">Reset All Data</Text>
                        </BlurView>
                    </TouchableOpacity>

                </ScrollView>
            </SafeAreaView >
        </View >
    );
}
