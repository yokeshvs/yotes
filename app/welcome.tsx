import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
    const router = useRouter();
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleGetStarted = async () => {
        try {
            await AsyncStorage.setItem('hasOnboarded', 'true');
            router.replace('/(tabs)');
        } catch (e) {
            console.error('[Welcome] Failed to save onboarding status', e);
        }
    };

    return (
        <SafeAreaView className={`flex-1 items-center justify-center px-8 relative ${isDark ? 'bg-black' : 'bg-white'}`}>
            {/* Clean Background - Removed blobs */}

            <View className="items-center mb-10">
                <Image
                    source={require('../assets/header_logo_brand.png')}
                    style={{ width: 360, height: 120, resizeMode: 'contain' }}
                />
            </View>

            <View className="space-y-4 mb-20">
                <Text className={`text-4xl font-bold text-center leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    Capture your <Text className="text-[#b8e82a]">thoughts</Text> beautifully.
                </Text>
                <Text className={`text-center text-lg px-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    A simple, elegant space for your ideas, tasks, and daily musings.
                </Text>
            </View>

            <TouchableOpacity
                onPress={handleGetStarted}
                className="w-full bg-[#b8e82a] py-5 rounded-full flex-row items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
                <Text className="text-black font-bold text-lg mr-2">Get Started</Text>
                <ArrowRight color="black" size={20} />
            </TouchableOpacity>

            <Text className="absolute bottom-12 text-gray-400 text-xs">Version 1.0.0</Text>
        </SafeAreaView>
    );
}
