import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
// import { Checkbox } from '@/components/ui/checkbox';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  YourScreenName: { category: number | null; page: number };
  // add other screens if needed
};

export const CategoryFilter = ({ categories = [] }: { categories?: any[] }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);

  const handleCategoryChange = useCallback(
    (categoryId: number) => {
      if (currentCategory === categoryId) {
        setCurrentCategory(null);
        navigation.navigate('YourScreenName', { category: null, page: 1 });
      } else {
        setCurrentCategory(categoryId);
        navigation.navigate('YourScreenName', { category: categoryId, page: 1 });
      }
    },
    [currentCategory, navigation]
  );

  // Mock categories if none provided by API
  const displayCategories = categories?.length
    ? categories
    : [
        { id: 1, name: 'Electronics', count: 120 },
        { id: 2, name: 'Clothing', count: 85 },
        { id: 3, name: 'Home & Garden', count: 45 },
      ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Categories</Text>
      <View style={styles.categoryList}>
        {displayCategories.map((cat) => (
          <View key={cat.id} style={styles.categoryItem}>
            <CheckBox
              value={currentCategory === cat.id}
              onValueChange={() => handleCategoryChange(cat.id)}
            />
            <TouchableOpacity
              onPress={() => handleCategoryChange(cat.id)}
              style={styles.labelContainer}>
              <Text style={styles.labelText}>{cat.name}</Text>
              <Text style={styles.countText}>({cat.count || 0})</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  header: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1E293B',
    marginBottom: 8,
  },
  categoryList: {
    marginVertical: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  labelText: {
    fontSize: 14,
    color: '#475569',
  },
  countText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});
