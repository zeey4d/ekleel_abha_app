import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';

export default function UnauthorizedScreen() {
  const { t } = useTranslation('common', {
    keyPrefix: 'Unauthorized',
  });

  return (
    <SafeAreaView className="flex-1 bg-slate-50 dark:bg-slate-950">
      <StatusBar translucent backgroundColor="transparent" />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          padding: 16,
        }}
      >
        <View className="max-w-2xl w-full self-center">
          {/* Card */}
          <View className="bg-white/90 dark:bg-slate-900/90 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">

            {/* Header */}
            <View className="bg-red-600 p-10 items-center">
              <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-6">
                <ShieldAlert size={48} color="white" />
              </View>

              <Text className="text-6xl font-black text-white mb-2">
                {t('code')}
              </Text>

              <Text className="text-2xl font-bold text-white mb-1">
                {t('title')}
              </Text>

              <Text className="text-white/90 text-base text-center">
                {t('message')}
              </Text>
            </View>

            {/* Content */}
            <View className="p-6 space-y-6">
              {/* Error Box */}
              <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5 flex-row">
                <View className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full items-center justify-center mr-4">
                  <Lock size={22} color="#dc2626" />
                </View>

                <View className="flex-1">
                  <Text className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                    {t('adminRequired')}
                  </Text>

                  <Text className="text-slate-700 dark:text-slate-300 mb-4">
                    {t('adminMessage')}
                  </Text>

                  <View className="space-y-1">
                    <Text className="text-sm text-slate-600 dark:text-slate-400">
                      • {t('reasons.notLoggedIn')}
                    </Text>
                    <Text className="text-sm text-slate-600 dark:text-slate-400">
                      • {t('reasons.noPrivileges')}
                    </Text>
                    <Text className="text-sm text-slate-600 dark:text-slate-400">
                      • {t('reasons.contactSupport')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* What To Do */}
              <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <Text className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                  {t('whatToDo.title')}
                </Text>

                <Text className="text-sm text-blue-700 dark:text-blue-400">
                  • {t('whatToDo.home')}
                </Text>
                <Text className="text-sm text-blue-700 dark:text-blue-400">
                  • {t('whatToDo.login')}
                </Text>
                <Text className="text-sm text-blue-700 dark:text-blue-400">
                  • {t('whatToDo.contact')}
                </Text>
              </View>

              {/* Actions */}
              <View className="space-y-3 pt-2">
                <Pressable
                  onPress={() => router.replace('/')}
                  className="h-14 rounded-xl bg-indigo-600 flex-row items-center justify-center"
                >
                  <Home size={20} color="white" />
                  <Text className="text-white font-bold ml-2">
                    {t('buttons.home')}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.replace('/login')}
                  className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex-row items-center justify-center"
                >
                  <ArrowLeft size={20} color="#475569" />
                  <Text className="text-slate-700 dark:text-slate-300 font-bold ml-2">
                    {t('buttons.login')}
                  </Text>
                </Pressable>
              </View>

              {/* Support */}
              <View className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <Text className="text-center text-sm text-slate-600 dark:text-slate-400">
                  {t('support')}
                </Text>
              </View>
            </View>
          </View>

          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            className="mt-6 flex-row items-center justify-center"
          >
            <ArrowLeft size={16} color="#64748b" />
            <Text className="text-slate-500 ml-1 text-sm font-medium">
              {t('buttons.back')}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
