import React from "react";
import { View } from "react-native";
import { CartItem } from "./CartItem";

interface CartListProps {
  cartItems: any[];
}

export const CartList = ({ cartItems }: CartListProps) => {
  return (
    <View className="gap-3">
      {cartItems.map((item) => (
        <CartItem key={item.id} item={item} />
      ))}
    </View>
  );
};