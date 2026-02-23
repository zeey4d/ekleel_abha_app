import React from 'react';
import Animated, {
  FadeIn,
  SlideInUp,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';

import { Search, Bell, Store, ChevronDown, MapPin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
// import { SearchBar } from '@/components/layout/header/SearchBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

interface HomeHeaderProps {
  scrollY?: SharedValue<number>;
}

export default function HomeHeader({ scrollY }: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
    const { t } = useTranslation('home');


  // Animation for header background  
  const animatedHeaderStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const opacity = interpolate(
      scrollY.value,
      [0, 800], // Extended range for slower/delayed transition
      [0, 2],
      // [0, 150], // Extended range for slower/delayed transition
      // [0, 1],
      Extrapolation.CLAMP
    );
    return {
      backgroundColor: `rgba(44, 124, 123, ${opacity})`,
      borderBottomWidth: interpolate(
        scrollY.value,
        [0, 150],
        [0, 0.5],
        Extrapolation.CLAMP
      ),
      borderBottomColor: `rgba(0, 0, 0, ${interpolate(
        scrollY.value,
        [0, 150],
        [0, 0.1],
        Extrapolation.CLAMP
      )})`,
    };
  });

  // Animation for location container (hide on scroll)
  const animatedLocationStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const height = interpolate(
      scrollY.value,
      [0, 50], // Delay hiding location slightly
      [24, 0],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollY.value,
      [0, 30],
      [1, 0],
      Extrapolation.CLAMP
    );
    return {
      height,
      opacity,
      marginBottom: interpolate(
        scrollY.value,
        [0, 50],
        [4, 0],
        Extrapolation.CLAMP
      ),
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingTop: insets.top },
        animatedHeaderStyle,
      ]}
    >
      {/* Location Selector */}
      <Animated.View style={[styles.locationContainer, animatedLocationStyle]}>
        <TouchableOpacity
          onPress={() =>
            router.push('/(tabs)/(home)/(context)/location-selector')
          }
          style={styles.locationContent}
        >
          <View style={styles.locationTextWrapper}>
            <MapPin size={16} color="#FF3B30" />
            <Text style={styles.locationTitle}>التوصيل إلى: </Text>
            <Text style={styles.locationName} numberOfLines={1}>
              الرياض، حي النرجس...
            </Text>
            <ChevronDown size={14} color="#666" />
          </View>
        </TouchableOpacity>
      </Animated.View>

      <Animated.View
        entering={SlideInUp.duration(600).delay(200)}
        style={styles.row}
      >
                {/* Icons (Right Side - RTL) */}
        <View className=' mt-2' style={styles.iconsRow}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push(`/(tabs)/(home)/(context)/brands`)}
            accessibilityLabel="الماركات"
            accessible
          >
            <Store size={18} color="#333" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push(`/(tabs)/(home)/(context)/notifications`)}
            accessibilityLabel="الإشعارات"
            accessible
          >
            <Bell size={18} color="#333" />
          </TouchableOpacity>
        </View>


        {/* Search Box */}
        <View className='w-full mt-2' style={styles.searchWrapper}>
          {/* <SearchBar /> */}
                <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => {
          console.log('🔍 Opening Search Landing Page');
          router.push("/(tabs)/(home)/(context)/(search)");
        }}
        className="relative flex-row items-center  rounded-full px-4 h-10 border border-transparent"
      >
        <Search size={20} color="#64748b" />
        
        <Text className="flex-1 ml-2 text-base text-slate-400">
          {t('Header.searchPlaceholder', { defaultValue: 'ابحث عن المنتجات...' })}
        </Text>
      </TouchableOpacity>

        </View>

      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Initial transparent background, handled by animated style
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // Removed paddingBottom per user request
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8,
    paddingBottom: 8,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  searchWrapper: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  locationContainer: {
    overflow: 'hidden',
    paddingHorizontal: 16, // Added padding for left alignment
  },
  locationContent: {
    alignItems: 'flex-start',
    padding: 6,
    justifyContent: 'center',
    width: '100%',
  },
  locationTextWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationTitle: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'System',
  },
  locationName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    maxWidth: 150,
  },
});
