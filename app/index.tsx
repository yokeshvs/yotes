import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

export default function Index() {
    const router = useRouter();

    useFocusEffect(useCallback(() => {
        // Ensure we are on the tabs route without pushing a new stack item
        router.replace('/(tabs)');
    }, []));

    return null;
}
