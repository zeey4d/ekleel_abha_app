// import React, { useEffect } from 'react';
// import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
// import { View, TextInput, TouchableOpacity, Text } from 'react-native';

// import { Search, Bell, Store, MapPin, ChevronDown } from 'lucide-react-native';
// import { useRouter } from 'expo-router';
// import { SearchBar } from '@/components/layout/header/SearchBar';

// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// // ... بقية الاستيرادات

// export default function HomeHeader() {
//   const insets = useSafeAreaInsets();
//   const router = useRouter();

//   return (
//     // استخدم View عادي بدلاً من SafeAreaView
//     <View style={{ 
//       backgroundColor: 'white', 
//       paddingTop: insets.top, // المسافة المطلوبة فقط للنوتش
//       height: 60 + insets.top, // ارتفاع ثابت ومحدد بدقة
//       justifyContent: 'center' 
//     }}>
//       <Animated.View 
//         entering={SlideInUp.duration(600).delay(200)} 
//         className="flex-row-reverse items-center px-4"
//       >
//         {/* شريط البحث */}
//         <View className=" h-10 flex-row-reverse items-center rounded-full bg-[#f5f5f5] ml-2">
//           <SearchBar />
//         </View>

//         {/* الأيقونات - تأكد من تحديد حجم ثابت h-9 w-9 */}
//         <TouchableOpacity 
//           className="h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5] ml-2"
//           onPress={() => router.push(`/(tabs)/(home)/(context)/brands`)}>
//           <Store size={18} color="#333" />
//         </TouchableOpacity>

//         <TouchableOpacity className="h-9 w-9 items-center justify-center rounded-full bg-[#f5f5f5]">
//           <Bell size={18} color="#333" />
//         </TouchableOpacity>
//       </Animated.View>
//     </View>
//   );
// }

import React from 'react';
import Animated, { FadeIn, SlideInUp } from 'react-native-reanimated';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

import { Search, Bell, Store, ChevronDown, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SearchBar } from '@/components/layout/header/SearchBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top, height: 60 + insets.top },
      ]}
    >
      <Animated.View
        entering={SlideInUp.duration(600).delay(200)}
        style={styles.row}
      >
        {/* أيقونات على اليمين (RTL) */}
        <View style={styles.iconsRow}>
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
            onPress={() => router.push('/notifications')}
            accessibilityLabel="الإشعارات"
            accessible
          >
            <Bell size={18} color="#333" />
          </TouchableOpacity>
        </View>

        {/* صندوق البحث */}
        <View style={styles.searchWrapper}>
          {/* يمكنك تمرير props إلى SearchBar مثل value, onChangeText, onSubmit */}
          <SearchBar />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  row: {
    flexDirection: 'row-reverse', // RTL: الأيقونات على اليمين
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 8, // ملاحظة: بعض إصدارات RN لا تدعم gap، إن لم تعمل استخدم margin
  },
  iconsRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  iconButton: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.8)', // خلفية شبه شفافة للأيقونات لتبدو أفضل
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  searchWrapper: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)', // خلفية شبه شفافة للبحث
    justifyContent: 'center',
    paddingHorizontal: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});
