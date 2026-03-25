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
          <Text className="text-sm font-medium text-foreground text-start">
            {option.name}: <Text className="text-muted-foreground font-normal">{selections[option.name]}</Text>
          </Text>
          
          <View className="flex-row flex-wrap gap-3">
            {option.values.map((val: any) => {
              const isColor = option.name.toLowerCase().includes("color") || option.name.toLowerCase().includes("لون");
              const valueName = typeof val === 'object' ? val.name : val;
              const isSelected = selections[option.name] === valueName;

              if (isColor) {
                // محاولة استخراج كود اللون إذا كان متاحاً في val.value أو استخدام الاسم إذا كان لوناً HTML صالحاً
                // هنا نفترض أن backend قد يعطينا كود HEX، وإلا سنستخدم الاسم
                const colorCode = typeof val === 'object' && val.value ? val.value : valueName.toLowerCase();

                return (
                  <Pressable
                    key={valueName}
                    onPress={() => onChange(option.name, valueName)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2",
                      isSelected ? "border-primary" : "border-transparent"
                    )}
                    style={{ backgroundColor: colorCode }}
                  />
                );
              }

              return (
                <Pressable
                  key={valueName}
                  onPress={() => onChange(option.name, valueName)}
                  className={cn(
                    "px-4 py-2 border rounded-md min-w-[3rem] items-center justify-center",
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-input bg-background"
                  )}
                >
                  <Text 
                    className={cn(
                      "text-sm",
                      isSelected ? "text-primary-foreground" : "text-foreground"
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