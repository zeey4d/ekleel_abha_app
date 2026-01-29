import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  I18nManager,
  Platform,
} from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { Text } from '@/components/ui/text';

// Animation configuration constants
const ANIMATION_CONFIG = {
  iconLift: -6, // pixels to lift on selection
  iconScale: 1.15, // scale factor when selected
  springConfig: {
    damping: 15,
    stiffness: 150,
    mass: 0.8,
  },
  timingDuration: 200,
};

// Tab bar height (adjustable)
export const TAB_BAR_HEIGHT = 65;

interface AnimatedTabItemProps {
  isFocused: boolean;
  options: any;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
  icon: React.ReactNode;
  accessibilityLabel?: string;
}

/**
 * Animated Tab Item with lift effect and smooth transitions
 */
function AnimatedTabItem({
  isFocused,
  options,
  onPress,
  onLongPress,
  label,
  icon,
  accessibilityLabel,
}: AnimatedTabItemProps) {
  // Shared value for animation progress
  const animationProgress = useSharedValue(isFocused ? 1 : 0);

  // Update animation when focus changes
  React.useEffect(() => {
    animationProgress.value = withSpring(
      isFocused ? 1 : 0,
      ANIMATION_CONFIG.springConfig
    );
  }, [isFocused, animationProgress]);

  // Animated style for icon container (lift + scale)
  const iconAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      animationProgress.value,
      [0, 1],
      [0, ANIMATION_CONFIG.iconLift]
    );
    const scale = interpolate(
      animationProgress.value,
      [0, 1],
      [1, ANIMATION_CONFIG.iconScale]
    );

    return {
      transform: [{ translateY }, { scale }],
    };
  });

  // Animated style for label opacity
  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(animationProgress.value, [0, 1], [0.7, 1]),
    };
  });

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={accessibilityLabel || label}
      accessibilityHint={`انتقل إلى ${label}`}
      onPress={onPress}
      onLongPress={onLongPress}
      style={styles.tabItem}
      activeOpacity={0.7}
    >
      <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
        {icon}
      </Animated.View>
      <Animated.View style={labelAnimatedStyle}>
        <Text
          style={[
            styles.label,
            {
              color: isFocused ? '#070707' : '#9ca3af',
              fontWeight: isFocused ? '600' : '400',
            },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

/**
 * Custom Animated Tab Bar with RTL support
 */
export default function AnimatedTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding for safe area
  const bottomPadding = Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.container,
        {
          height: TAB_BAR_HEIGHT + bottomPadding,
          paddingBottom: bottomPadding,
          // RTL support
          flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        
        // Skip hidden tabs (href: null)
        if (options.href === null) {
          return null;
        }

        // Get label
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        // Get icon with current color
        const iconColor = isFocused ? '#070707' : '#d3d3d3';
        const iconSize = 24;
        const icon = options.tabBarIcon
          ? options.tabBarIcon({
              focused: isFocused,
              color: iconColor,
              size: iconSize,
            })
          : null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <AnimatedTabItem
            key={route.key}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
            onLongPress={onLongPress}
            label={label}
            icon={icon}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 8,
    // Shadow for iOS
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    textAlign: 'center',
  },
});
