import React from "react";
import { View } from "react-native";
import { CartItem } from "./CartItem";
import { CartItem as CartItemType } from "@/store/types";

interface CartListProps {
  cartItems: CartItemType[];
}

export const CartList = ({ cartItems }: CartListProps) => {
  return (
    // 'space-y-4' in NativeWind adds space between children automatically
    <View className="space-y-4">
      {cartItems.map((item) => (
        <CartItem 
          key={item.id} 
          item={item} 
        />
      ))}
    </View>
  );
};