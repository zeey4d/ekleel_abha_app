import React from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { cn } from '@/lib/utils';

const alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const BrandAlphabet = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View className="mb-12 border-y border-slate-100 py-6">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        <View className="flex-row gap-2">
          {alphabet.map((letter) => {
            const isCurrent = pathname?.endsWith(`/letter/${letter}`);
            return (
              <Pressable
                key={letter}
                onPress={() => router.push(`/(tabs)/(shop)/brands/letter/${letter}` as any)}
                className={cn(
                  'w-10 h-10 items-center justify-center rounded-md',
                  isCurrent
                    ? 'bg-primary shadow-md'
                    : 'bg-white border border-slate-200'
                )}
              >
                <Text
                  className={cn(
                    'text-sm font-medium',
                    isCurrent ? 'text-white' : 'text-slate-600'
                  )}
                >
                  {letter}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};