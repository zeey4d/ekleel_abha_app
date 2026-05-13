
import React from "react";
import { Text, TouchableHighlight, View, I18nManager } from "react-native";
import { ChevronRight, ChevronLeft } from "lucide-react-native";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";

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
    <TouchableHighlight
      onPress={handlePress}
      underlayColor="#f8fafc"
      style={{ backgroundColor: "transparent" }}
      className={cn(
        !isLast && "border-b border-slate-100 dark:border-slate-800/50"
      )}
    >
      <View className={cn("flex-row items-center p-5 gap-3", I18nManager.isRTL && "flex-row-reverse")}>
        {/* Icon */}
        <View className="bg-teal-50 dark:bg-teal-900/10 p-2.5 rounded-xl">
          <Icon size={20} className="text-teal-600" />
        </View>

        {/* Title */}
        <Text style={{ fontFamily: 'Tajawal_700Bold', textAlign: I18nManager.isRTL ? 'right' : 'left' }} className="flex-1 text-[15px] text-slate-700 dark:text-slate-200">
          {title}
        </Text>

        {/* Optional Value */}
        {value && (
          <Text style={{ fontFamily: 'Tajawal_700Bold' }} className="text-slate-500 dark:text-slate-400 text-sm">
            {value}
          </Text>
        )}

        {/* Arrow */}
        {I18nManager.isRTL ? (
           <ChevronLeft size={20} className="text-slate-300 dark:text-slate-600" />
        ) : (
           <ChevronRight size={20} className="text-slate-300 dark:text-slate-600" />
        )}
      </View>
    </TouchableHighlight>
  );
}
