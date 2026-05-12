import React from "react";
import { View, Text, Image, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { Minus, Plus, Trash2 } from "lucide-react-native";
import { useUpdateCartItemMutation, useRemoveFromCartMutation } from "@/store/features/cart/cartSlice";
import { useTranslation } from "react-i18next";
import { getImageUrl } from "@/lib/image-utils";
import { router } from "expo-router";

interface CartItemProps {
  item: any;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { t } = useTranslation("cart");
  const [updateItem, { isLoading: isUpdating }] = useUpdateCartItemMutation();
  const [removeItem, { isLoading: isRemoving }] = useRemoveFromCartMutation();

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    updateItem({ id: item.id, quantity: newQty })
      .unwrap()
      .catch(() => Alert.alert(t("CartItem.updateFailed")));
  };

  const handleRemove = () => {
    Alert.alert(
      t("CartItem.remove"),
      undefined,
      [
        { text: t("CartItem.remove"), style: "destructive", onPress: () => {
          removeItem({ id: item.id })
            .unwrap()
            .catch(() => Alert.alert(t("CartItem.removeFailed")));
        }},
        { text: t("Common.cancel", "Cancel"), style: "cancel" },
      ]
    );
  };

  const isLoading = isUpdating || isRemoving;

  return (
    <View 
      className="flex-row gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2
      }}
    >
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/(cart)/(context)/products/${item.product_id}`)}
        activeOpacity={0.8}
        className="bg-slate-50 rounded-xl p-2 items-center justify-center border border-slate-50"
      >
        <Image
          source={{ uri: getImageUrl(item.image) }}
          className="w-20 h-20"
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Info */}
      <View className="flex-1">
        {/* Header Row: Name & Remove */}
        <View className="flex-row justify-between items-start">
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/(cart)/(context)/products/${item.product_id}`)}
            activeOpacity={0.7}
            className="flex-1 mr-2"
          >
            <Text className="font-bold text-slate-900 text-[14px] leading-5" numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleRemove}
            disabled={isLoading}
            className="p-1"
            activeOpacity={0.6}
          >
            <Trash2 size={18} color={isLoading ? "#fca5a5" : "#ef4444"} />
          </TouchableOpacity>
        </View>

        {/* Details / Model */}
        {item.model ? (
          <Text className="text-[11px] text-slate-400 mt-1 uppercase tracking-wider">{item.model}</Text>
        ) : null}

        {/* Controls & Price */}
        <View className="flex-row items-end justify-between mt-4">
          {/* Quantity Controls */}
          <View className="flex-row items-center bg-slate-50 rounded-xl px-1 py-1 border border-slate-100">
            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-lg bg-white shadow-sm"
              onPress={() => handleQuantityChange(item.quantity - 1)}
              disabled={isLoading || item.quantity <= 1}
              activeOpacity={0.6}
            >
              <Minus size={14} color={isLoading || item.quantity <= 1 ? "#cbd5e1" : "#1e293b"} />
            </TouchableOpacity>

            <View className="w-10 items-center justify-center">
              {isUpdating ? (
                <ActivityIndicator size="small" color="#10b981" />
              ) : (
                <Text className="text-sm font-bold text-slate-900">{item.quantity}</Text>
              )}
            </View>

            <TouchableOpacity
              className="w-8 h-8 items-center justify-center rounded-lg bg-white shadow-sm"
              onPress={() => handleQuantityChange(item.quantity + 1)}
              disabled={isLoading}
              activeOpacity={0.6}
            >
              <Plus size={14} color={isLoading ? "#cbd5e1" : "#1e293b"} />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View className="items-end">
            <Text className="text-[11px] text-slate-400 mb-0.5">
              {Number(item.final_price || 0).toFixed(0)} SAR
            </Text>
            <Text className="font-extrabold text-[16px] text-primary">
              {Number(item.total || 0).toFixed(0)} <Text className="text-[10px] font-bold">SAR</Text>
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};