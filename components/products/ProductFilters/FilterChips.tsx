// import React from 'react';
// import { View, TouchableOpacity, ScrollView } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { X } from 'lucide-react-native';
// // استيراد المكونات من Reusables
// import { Badge } from '@/components/ui/badge';
// import { Text } from '@/components/ui/text';
// import { cn } from '@/lib/utils';

// export const FilterChips = () => {
//   const router = useRouter();
//   const params = useLocalSearchParams();

//   // تحويل المعاملات النشطة إلى مصفوفة لعرضها
//   const activeFilters = React.useMemo(() => {
//     return Object.entries(params)
//       .filter(([key]) => !['page', 'sort', 'per_page'].includes(key))
//       .map(([key, value]) => ({
//         key,
//         label: key === 'category' ? 'Category' : key.replace('_', ' '),
//         value: String(value),
//       }));
//   }, [params]);

//   const removeFilter = (key: string) => {
//     // في Expo Router، نرسل القيمة كـ undefined لحذف المعامل
//     router.setParams({ [key]: undefined });
//   };

//   const clearAll = () => {
//     // لتنظيف كل شيء، نضبط المعاملات الأساسية لـ undefined
//     const resetParams = activeFilters.reduce((acc, curr) => {
//       acc[curr.key] = undefined;
//       return acc;
//     }, {} as any);

//     router.setParams(resetParams);
//   };

//   if (activeFilters.length === 0) return null;

//   return (
//     <View className="mb-4">
//       <ScrollView
//         horizontal
//         showsHorizontalScrollIndicator={false}
//         contentContainerStyle={{ gap: 8, paddingHorizontal: 4 }}>
//         {activeFilters.map((filter) => (
//           <Badge
//             key={filter.key}
//             variant="secondary"
//             className="flex-row items-center gap-2 rounded-full px-3 py-1.5">
//             <Text className="text-xs capitalize">
//               {filter.label}: {filter.value}
//             </Text>
//             <TouchableOpacity
//               onPress={() => removeFilter(filter.key)}
//               hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
//               <X size={14} className="text-muted-foreground" />
//             </TouchableOpacity>
//           </Badge>
//         ))}

//         <TouchableOpacity onPress={clearAll} className="justify-center px-2">
//           <Text className="text-xs font-medium text-primary">Clear All</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </View>
//   );
// };
