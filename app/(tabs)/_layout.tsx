import { useTheme } from '@/context/ThemeContext';
import { useRouter } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

export default function TabLayout() {
  // Configures the Tab Layout
  const router = useRouter();
  const { colorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  // Brand colors
  const tintColor = '#b8e82a'; // Lime Green
  // Reference uses dynamic colors for icons. 
  // We'll use Gray for inactive to ensure visibility on glass.
  const inactiveTintColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <NativeTabs
      tintColor={tintColor}
      iconColor={inactiveTintColor}
      labelVisibilityMode="labeled"
      disableTransparentOnScrollEdge={true}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf="house.fill" selectedColor={tintColor} />
        <Label>Home</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="search-nav"
      >
        <Icon sf="magnifyingglass" selectedColor={tintColor} />
        <Label>Search</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger
        name="new-nav"
      >
        <Icon sf="plus.circle.fill" selectedColor={tintColor} />
        <Label>New</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="timeline">
        <Icon sf="calendar" selectedColor={tintColor} />
        <Label>Timeline</Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="settings">
        <Icon sf="gearshape.fill" selectedColor={tintColor} />
        <Label>Settings</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
