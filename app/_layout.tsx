import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

import { NotesProvider } from '@/context/NotesContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

import { ThemeProvider as ThemeContextProvider, useTheme } from '@/context/ThemeContext';

export default function RootLayoutWrapper() {
  return (
    <ThemeContextProvider>
      <RootLayoutContent />
    </ThemeContextProvider>
  );
}

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        // Strict Rule: If we have notes, go to Home. Else, Welcome.
        const savedNotes = await AsyncStorage.getItem('savedNotes');

        let noteCount = 0;

        if (savedNotes) {
          try {
            const notes = JSON.parse(savedNotes);
            if (Array.isArray(notes)) {
              noteCount = notes.length;
            }
          } catch (e) {
            console.warn('[Layout] Error parsing notes', e);
          }
        }

        // Check both: explicit flag (user passed welcome) OR existence of notes (user has data).
        setIsOnboarded(!!onboarded || noteCount > 0);

      } catch (e) {
        console.error('[Layout] Session check failed', e);
        setIsOnboarded(false);
      } finally {
        setIsSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (loaded && isSessionChecked) {
      if (!isOnboarded) {
        router.replace('/welcome');
      }
      // If onboarded, we do nothing because (tabs) is the default initial route.
      SplashScreen.hideAsync();
    }
  }, [loaded, isSessionChecked, isOnboarded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#000' : '#F2F2F7' }}>
      <NotesProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack
            screenOptions={{
              contentStyle: {
                backgroundColor: colorScheme === 'dark' ? '#000' : '#F2F2F7',
              },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="welcome" options={{ headerShown: false }} />
            <Stack.Screen name="new-note" options={{ presentation: 'modal', headerShown: false }} />
            <Stack.Screen name="search" options={{ presentation: 'fullScreenModal', headerShown: false }} />
            <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </NotesProvider>
    </GestureHandlerRootView>
  );
}
