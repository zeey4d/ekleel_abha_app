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
        { text: "✕", style: "cancel" },
      ]
    );
  };

  const isLoading = isUpdating || isRemoving;

  return (
    <View className="flex-row gap-3 bg-white p-3 rounded-xl border border-slate-100">
      {/* Product Image */}
      <TouchableOpacity
        onPress={() => router.push(`/(tabs)/(home)/(context)/products/${item.product_id}`)}
        activeOpacity={0.7}
      >
        <View className="w-24 h-24  rounded-lg overflow-hidden items-center justify-center">
          <Image
            source={{ uri: getImageUrl(item.image) }}
            className="w-20 h-20"
            resizeMode="contain"
          />
        </View>
      </TouchableOpacity>

      {/* Info */}
      <View className="flex-1 justify-between">
        {/* Name & Price Row */}
        <View>
          <TouchableOpacity
            onPress={() => router.push(`/(tabs)/(home)/(context)/products/${item.product_id}`)}
            activeOpacity={0.7}
          >
            <Text className="font-semibold text-slate-900 text-sm" numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>

          {/* Model & Options */}
          {item.model ? (
            <Text className="text-xs text-slate-400 mt-0.5">{item.model}</Text>
          ) : null}
          {item.options?.map((opt: any) => (
            <Text key={opt.id} className="text-xs text-slate-400">
              {opt.name}: {opt.value}
            </Text>
          ))}
        </View>

        {/* Controls */}
        <View className="flex-row items-end justify-between mt-3">
          <View className="flex-row items-center gap-3">
            {/* Quantity Controls */}
            <View className="flex-row items-center border border-slate-200 rounded-lg h-9">
              <TouchableOpacity
                className="w-8 h-full items-center justify-center"
                onPress={() => handleQuantityChange(item.quantity - 1)}
                disabled={isLoading || item.quantity <= 1}
                activeOpacity={0.6}
              >
                <Minus size={12} color={isLoading || item.quantity <= 1 ? "#cbd5e1" : "#64748b"} />
              </TouchableOpacity>

              <View className="w-10 items-center justify-center">
                {isUpdating ? (
                  <ActivityIndicator size="small" color="#64748b" />
                ) : (
                  <Text className="text-sm font-medium text-slate-900">{item.quantity}</Text>
                )}
              </View>

              <TouchableOpacity
                className="w-8 h-full items-center justify-center"
                onPress={() => handleQuantityChange(item.quantity + 1)}
                disabled={isLoading}
                activeOpacity={0.6}
              >
                <Plus size={12} color={isLoading ? "#cbd5e1" : "#64748b"} />
              </TouchableOpacity>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={handleRemove}
              disabled={isLoading}
              className="flex-row items-center gap-1"
              activeOpacity={0.6}
            >
              <Trash2 size={16} color={isLoading ? "#fca5a5" : "#ef4444"} />
            </TouchableOpacity>
          </View>

          {/* Price */}
          <View className="items-end">
            <Text className="text-xs text-slate-400">
              ${Number(item.final_price || 0).toFixed(2)} {t("CartItem.each", { price: "" }).replace("{price}", "").trim()}
            </Text>
            <Text className="font-bold text-base text-slate-900">
              ${Number(item.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};