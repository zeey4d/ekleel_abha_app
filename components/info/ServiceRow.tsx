
import React from "react";
import { Text, Pressable, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { useRouter } from "expo-router";

type Props = {
  Icon: React.ElementType;
  title: string;
  value?: string;       // مثل: اللغة العربية
  href?: string;
  isLast?: boolean;
  onPress?: () => void;
};

export default function ServiceRow({
  Icon,
  title,
  value,
  href,
  isLast = false,
  onPress,
}: Props) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (href) {
      router.push(href as any);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={[
        "bg-white flex-row items-center p-5 gap-3",
        !isLast && "border-b border-gray-100",
        "active:opacity-80",
      ].join(" ")}
    >
      {/* Icon */}
      <Icon size={22} color="#0baa92ff" />

      {/* Title */}
      <Text className="flex-1 text-base text-slate-700 font-cairo">
        {title}
      </Text>

      {/* Optional Value */}
      {value && (
        <Text className="text-[#1D64A1] font-medium font-cairo">
          {value}
        </Text>
      )}

      {/* Arrow */}
      <ChevronRight size={18} color="#D1D5DB" className="rtl:rotate-180" />
    </Pressable>
  );
}
