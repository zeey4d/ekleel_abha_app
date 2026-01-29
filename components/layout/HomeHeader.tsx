import React from 'react';
import { View, TextInput, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Bell, Store, MapPin, ChevronDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function HomeHeader() {
    const router = useRouter();
  
  return (
    <SafeAreaView edges={['top']} className="bg-transparent" >
    <View className=" pt-4 px-4 pb-4">
      
      {/* الموقع */}
      {/* <View className="flex-row items-center justify-end mb-3">
        <ChevronDown size={18} color="#fff" />
        <Text className="text-white text-[13px] mx-1">
          الرياض - Al Woroud
        </Text>
        <MapPin size={18} color="#fff" />
      </View> */}

      {/* البحث + الأيقونات */}
      <View className="flex-row-reverse items-center">
        
        {/* البحث */}
        <View className="flex-1 h-11 bg-white rounded-full flex-row-reverse items-center px-4 ml-2 bg-[#ebebebff]">
          <Search size={20} color="#999" />
          <TextInput
            placeholder="بحث..."
            placeholderTextColor="#999"
            className="flex-1 text-right mr-2 text-[14px]"
          />
        </View>

        {/* أيقونة الباند / المتجر */}
        <TouchableOpacity
          className="w-10 h-10 bg-white rounded-full items-center justify-center ml-2 bg-[#ebebebff]"
          onPress={() => {
            // window.location.href = '/brands';
                          router.push(`/brands` as any);

          }}

        >
          <Store size={20} color="#333" />
        </TouchableOpacity>

        {/* الإشعارات */}
        <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center ml-2 bg-[#ebebebff]">
          <Bell size={20} color="#333" />
        </TouchableOpacity>

      </View>
    </View>
    </SafeAreaView>
  );
}
