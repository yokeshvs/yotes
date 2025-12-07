import FontAwesome from '@expo/vector-icons/FontAwesome';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import '../global.css';

import { useColorScheme } from '@/components/useColorScheme';
import { NotesProvider } from '@/context/NotesContext';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'welcome',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  const [isSessionChecked, setIsSessionChecked] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setIsOnboarded(!!onboarded);
      } catch (e) {
        console.error('Session check failed', e);
      } finally {
        setIsSessionChecked(true);
      }
    };
    checkSession();
  }, []);

  useEffect(() => {
    if (loaded && isSessionChecked) {
      if (isOnboarded) {
        router.replace('/(tabs)');
      } else {
        router.replace('/welcome');
      }
      SplashScreen.hideAsync();
    }
  }, [loaded, isSessionChecked, isOnboarded]);

  if (!loaded) {
    return null;
  }

  return (
    <NotesProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="welcome" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen name="settings" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="new-note" options={{ presentation: 'modal', headerShown: false }} />
          <Stack.Screen name="search" options={{ presentation: 'fullScreenModal', headerShown: false }} />
          <Stack.Screen name="note/[id]" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </NotesProvider>
  );
}
