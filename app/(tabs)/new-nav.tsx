import { useTheme } from '@/context/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { View } from 'react-native';

/**
 * Create Note Dummy Route
 * 
 * This is a workaround for the experimental NativeTabs component.
 * We need to trigger a router.push() to open the New Note modal, but NativeTabs
 * doesn't easily support 'preventDefault' on tab press yet.
 * 
 * So we navigate to this invisible page, which immediately redirects to the Modal
 * and mostly silently goes back to the previous tab.
 */
export default function CreateDummy() {
    const router = useRouter();
    const navigation = useNavigation();
    const { colorScheme } = useTheme();

    useFocusEffect(
        useCallback(() => {
            const timeout = setTimeout(() => {
                router.push('/new-note');
                // Go back to previous tab to prevent loop
                if (navigation.canGoBack()) {
                    navigation.goBack();
                } else {
                    router.replace('/');
                }
            }, 10);

            return () => clearTimeout(timeout);
        }, [router, navigation])
    );

    return <View style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#F2F2F7' }} />;
}
