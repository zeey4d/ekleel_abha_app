import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import {
  Gift,
  Heart,
  Globe,
  Headphones,
  Info,
  Briefcase,
  ChevronLeft,
} from 'lucide-react-native';
import LanguageSwitcher from '@/components/Language/LanguageSwitcher';

const Item = ({ icon: Icon, title, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="
      flex-row-reverse items-center
      justify-between
      py-4 px-4
      border-b border-gray-100
    "
  >
    <View className="flex-row-reverse items-center gap-3">
      <Icon size={18} color="#333" />
      <Text className="text-[15px] text-gray-900">{title}</Text>
    </View>

    <ChevronLeft size={18} color="#999" />
  </TouchableOpacity>
);

export default function AccountScreen() {
  return (
    <ScrollView className="flex-1 bg-gray-100 mt-10">
      {/* تسجيل دخول */}
      <View className="mx-4 mt-4 mb-3 rounded-xl bg-white">
        <TouchableOpacity className="py-4 items-center">
          <Text className="text-blue-600 text-[15px] font-medium">
            تسجيل دخول
          </Text>
        </TouchableOpacity>
      </View>

      {/* القائمة */}
      <View className="mx-4 rounded-xl bg-white overflow-hidden py-2 px-2">
        <Item title="إهداء رصيد" icon={Gift} />
        <Item title="المفضلات" icon={Heart} />
        {/* <Item title="البلد واللغة" icon={Globe} /> */}
        <Item title="المساعدة والدعم" icon={Headphones} />
        <Item title="حول نايس ون" icon={Info} />
        <Item title="الوظائف" icon={Briefcase} />
               <View className="">
                    <LanguageSwitcher />
                  </View>
      </View>

      {/* الفوتر */}
      {/* <View className="mt-10 items-center px-6">
        <Text className="text-xs text-gray-500 mb-1">
          © 2026 جميع الحقوق محفوظة نايس ون
        </Text>
        <Text className="text-[11px] text-gray-400 text-center">
          رقم السجل التجاري 1010705691 — الرقم الضريبي 310534949600003
        </Text>
      </View> */}
    </ScrollView>
  );
}
