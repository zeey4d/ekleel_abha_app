// import React from 'react';
// import { FlatList, View, StyleSheet, Dimensions, FlatListProps } from 'react-native';
// import { ProductCard } from './ProductCard';
// import { Product } from '@/store/types';

// interface ProductGridProps extends Partial<FlatListProps<Product>> {
//   products: Product[];
//   viewMode?: 'grid' | 'list';
//   style?: object;
// }

// // حساب العرض لتحديد المسافات (اختياري)
// const { width } = Dimensions.get('window');

// export const ProductGrid = ({ products, viewMode = 'grid', style, ...props }: ProductGridProps) => {
//   if (!products && !props.ListEmptyComponent) {
//     return null;
//   }

//   // في React Native، عند تغيير عدد الأعمدة (numColumns) ديناميكياً،
//   // يجب تغيير الـ key الخاص بالـ FlatList لإعادة بناء المكون.
//   // تم إزالة keyExtractor من هنا لأنه يمكن تمريره عبر props إذا لزم الأمر، لكن سنبقيه كافتراضي
//   const defaultKeyExtractor = (item: Product) => item.id.toString();

//   return (
//     <FlatList
//       key={viewMode} // مهم جداً عند التحويل بين Grid و List
//       data={products}
//       keyExtractor={props.keyExtractor || defaultKeyExtractor}
//       numColumns={viewMode === 'grid' ? 2 : 1} // نظام العمودين للجوال
//       renderItem={({ item }) => (
//         <View style={viewMode === 'grid' ? styles.gridItem : styles.listItem}>
//           <ProductCard product={item} layout={viewMode} />
//         </View>
//       )}
//       contentContainerStyle={[styles.container, style]}
//       columnWrapperStyle={viewMode === 'grid' ? styles.row : null}
//       showsVerticalScrollIndicator={false}
//       {...props}
//     />
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     padding: 10,
//   },
//   row: {
//     justifyContent: 'space-between', // لتوزيع الكروت بشكل متساوي في الـ Grid
//   },
//   gridItem: {
//     flex: 0.5, // يأخذ نصف المساحة (لأننا حددنا عمودين)
//     padding: 5,
//   },
//   listItem: {
//     width: '100%',
//     marginBottom: 12,
//   },
// });
