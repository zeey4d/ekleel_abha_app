import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { I18nManager } from 'react-native';
import { cn } from '@/lib/utils';
import { Check, MapPin } from 'lucide-react-native';
import type { Address } from '@/store/types';

interface Props {
  address: Address;
  selected: boolean;
  onSelect: () => void;
}

export function AddressCard({ address, selected, onSelect }: Props) {
  const fullName = `${address.firstname} ${address.lastname}`.trim();
  const cityLine = [address.address_1, address.city].filter(Boolean).join('، ');

  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        "flex-row items-center gap-4 bg-white rounded-[32px] border-[1.5px] p-5 mb-3",
        selected ? "border-teal-600 bg-teal-50/30 shadow-sm" : "border-slate-200/80",
        I18nManager.isRTL && "flex-row-reverse"
      )}
      style={({ pressed }) => [pressed && { opacity: 0.85 }]}
    >
      {/* Selection indicator */}
      <View className={cn(
        "w-6 h-6 rounded-full border-2 items-center justify-center shrink-0",
        selected ? "border-teal-600" : "border-slate-300"
      )}>
        {selected && <View className="w-3 h-3 rounded-full bg-teal-600" />}
      </View>

      {/* Address body */}
      <View className="flex-1 gap-1.5 min-w-0">
        {/* Icon + Name row */}
        <View className={cn("flex-row items-center gap-2 flex-wrap", I18nManager.isRTL && "flex-row-reverse")}>
          <View className={cn(
            "w-7 h-7 rounded-lg items-center justify-center",
            selected ? "bg-teal-100/50" : "bg-slate-100"
          )}>
            <MapPin size={16} className={selected ? "text-teal-600" : "text-slate-400"} strokeWidth={2} />
          </View>
          <Text className={cn(
            "text-[15px] font-bold font-tajawal shrink",
            selected ? "text-teal-800" : "text-slate-700",
            I18nManager.isRTL ? "text-right" : "text-left"
          )} numberOfLines={1}>
            {fullName}
          </Text>
          {address.default && (
            <View className="bg-teal-100/50 px-2.5 py-0.5 rounded-full">
              <Text className="text-[11px] font-bold text-teal-700 font-tajawal">افتراضي</Text>
            </View>
          )}
        </View>

        <Text className={cn(
            "text-[14px] text-slate-500 font-tajawal leading-relaxed",
            I18nManager.isRTL ? "text-right" : "text-left"
        )} numberOfLines={2}>
          {cityLine}
        </Text>

        {address.address_2 ? (
          <Text className={cn(
            "text-[12px] text-slate-400 font-tajawal",
            I18nManager.isRTL ? "text-right" : "text-left"
          )} numberOfLines={1}>
            {address.address_2}
          </Text>
        ) : null}
      </View>

      {/* Selected checkmark */}
      {selected && (
        <View className="w-6 h-6 rounded-full bg-teal-600 items-center justify-center shrink-0">
          <Check size={14} color="#fff" strokeWidth={3} />
        </View>
      )}
    </Pressable>
  );
}


