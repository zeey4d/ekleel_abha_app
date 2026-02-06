import React from "react";
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/store/features/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/lib/image-utils";
import { useRouter } from "expo-router";
import { CartItem as CartItemType } from "@/store/types";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { t } = useTranslation('cart');
  const router = useRouter();
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    updateItem({ id: item.id, quantity: newQty })
      .unwrap()
      .catch(() => Alert.alert(t('Error'), t('CartItem.updateFailed')));
  };

  const handleRemove = () => {
    Alert.alert(
      t('CartItem.removeConfirmTitle' || 'Remove Item'),
      t('CartItem.removeConfirmMessage' || 'Are you sure?'),
      [
        { text: t('Cancel'), style: 'cancel' },
        { 
          text: t('Remove'), 
          style: 'destructive', 
          onPress: () => {
            removeItem({ id: item.id })
              .unwrap()
              .catch(() => Alert.alert(t('Error'), t('CartItem.removeFailed')));
          }
        }
      ]
    );
  };

  const isLoading = isUpdating || isRemoving;
  const finalPrice = Number(item.final_price) || 0;
  const totalPrice = Number(item.total) || 0;

  return (
    <View className="flex-row bg-white p-3 rounded-2xl border border-slate-100 mb-3 shadow-sm">
      {/* Image Container */}
      <View className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden items-center justify-center">
        <Image
          source={{ uri: getImageUrl(item.image) }}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </View>

      {/* Content Container */}
      <View className="flex-1 ml-3 justify-between">
        <View>
          <View className="flex-row justify-between items-start">
            <TouchableOpacity 
              className="flex-1 mr-2"
              onPress={() => router.push(`/(tabs)/(cart)/(context)/products/${item.product_id}`)}
            >
              <Text className="font-bold text-slate-900 text-sm" numberOfLines={2}>
                {item.name}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleRemove} disabled={isLoading}>
              <Trash2 size={18} color="#ef4444" />
            </TouchableOpacity>
          </View>

          {/* Model & Options */}
          <View className="mt-1">
            {item.model && (
              <Text className="text-[10px] text-slate-400 uppercase tracking-tighter">
                {item.model}
              </Text>
            )}
            {item.options?.map((opt: any) => (
              <Text key={opt.id} className="text-[11px] text-slate-500">
                {opt.name}: {opt.value}
              </Text>
            ))}
          </View>
        </View>

        {/* Footer: Price & Quantity */}
        <View className="flex-row justify-between items-end mt-2">
          {/* Quantity Controls */}
          <View className="flex-row items-center border border-slate-200 rounded-lg h-9">
            <TouchableOpacity
              className="w-8 h-full items-center justify-center"
              onPress={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
            >
              <Minus size={14} color={item.quantity <= 1 ? "#cbd5e1" : "#64748b"} />
            </TouchableOpacity>

            <View className="w-8 items-center justify-center">
              {isUpdating ? (
                <ActivityIndicator size="small" color="#2563eb" />
              ) : (
                <Text className="text-sm font-bold text-slate-900">{item.quantity}</Text>
              )}
            </View>

            <TouchableOpacity
              className="w-8 h-full items-center justify-center"
              onPress={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading}
            >
              <Plus size={14} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View className="items-end">
            <Text className="text-[10px] text-slate-400 line-through">
              ${(finalPrice * item.quantity).toFixed(2)}
            </Text>
            <Text className="font-bold text-base text-blue-600">
              ${totalPrice.toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};