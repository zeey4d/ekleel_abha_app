import React from 'react';
import { View, Pressable } from 'react-native';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';

interface ProductOptionsProps {
  options: any[];
  selections: Record<string, string>;
  onChange: (name: string, value: string) => void;
}

export const ProductOptions = ({ options, selections, onChange }: ProductOptionsProps) => {
  if (!options || options.length === 0) return null;

  return (
    <View className="gap-6">
      {options.map((option) => (
        <View key={option.id || option.name} className="gap-3">
          {/* عنوان الخيار (مثل: اللون أو المقاس) */}
          <View className="flex-row items-center gap-2">
            <Text className="text-sm font-bold text-slate-900">
              {option.name}:
            </Text>
            <Text className="text-sm text-slate-500">
              {selections[option.name] || 'لم يتم الاختيار'}
            </Text>
          </View>
          
          <View className="flex-row flex-wrap gap-3">
            {option.values.map((val: any) => {
              const isColor = option.name.toLowerCase().includes("color") || option.name.includes("اللون");
              const valueName = typeof val === 'object' ? val.name : val;
              const isSelected = selections[option.name] === valueName;

              // تصميم خيارات الألوان (دوائر)
              if (isColor) {
                return (
                  <Pressable
                    key={valueName}
                    onPress={() => onChange(option.name, valueName)}
                    className={cn(
                      "w-10 h-10 rounded-full border-2 items-center justify-center",
                      isSelected ? "border-primary shadow-sm" : "border-transparent"
                    )}
                  >
                    <View 
                      className="w-8 h-8 rounded-full border border-black/10"
                      style={{ backgroundColor: valueName.toLowerCase() }}
                    />
                  </Pressable>
                );
              }

              // تصميم الخيارات النصية (مثل المقاسات)
              return (
                <Pressable
                  key={valueName}
                  onPress={() => onChange(option.name, valueName)}
                  className={cn(
                    "px-5 py-2.5 border rounded-xl min-w-[3.5rem] items-center justify-center",
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-border bg-card"
                  )}
                >
                  <Text 
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary-foreground" : "text-slate-700"
                    )}
                  >
                    {valueName}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
};