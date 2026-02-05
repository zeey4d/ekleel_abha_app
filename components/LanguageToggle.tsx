// import React, { useState } from 'react';
// import { TouchableOpacity, Alert } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import { Text } from '@/components/ui/text';
// import { Icon } from '@/components/ui/icon';
// import { Languages } from 'lucide-react-native';
// import { changeLanguage } from '@/lib/i18n';
// import { LanguageChangeOverlay } from './LanguageChangeOverlay';

// export function LanguageToggle() {
//   const { i18n, t } = useTranslation();
//   const [isChanging, setIsChanging] = useState(false);

//   const handleToggleLanguage = () => {
//     const currentLang = i18n.language;
//     const newLang = currentLang === 'ar' ? 'en' : 'ar';
//     const newLangName = newLang === 'ar' ? 'العربية' : 'English';

//     Alert.alert(
//       t('common:change_language', 'تغيير اللغة'),
//       t('common:restart_confirm', 'سيتم إعادة تشغيل التطبيق لتطبيق اللغة الجديدة. هل أنت متأكد؟', { lang: newLangName }),
//       [
//         {
//           text: t('common:cancel', 'إلغاء'),
//           style: 'cancel',
//         },
//         {
//           text: t('common:confirm', 'نعم، تغيير'),
//           onPress: async () => {
//             try {
//               setIsChanging(true);
//               // Small delay to allow modal to render before heavy lifting/restart begins
//               setTimeout(async () => {
//                 await changeLanguage(newLang);
//               }, 100);
//             } catch (error) {
//               console.error('Failed to change language:', error);
//               setIsChanging(false);
//               Alert.alert('Error', 'Failed to change language. Please try again.');
//             }
//           },
//         },
//       ]
//     );
//   };

//   return (
//     <>
//       <TouchableOpacity
//         onPress={handleToggleLanguage}
//         className="flex-row items-center gap-2 rounded-lg bg-primary/10 px-4 py-2"
//         activeOpacity={0.7}
//         disabled={isChanging}
//       >
//         <Icon as={Languages} size={20} className="text-primary" />
//         <Text className="text-sm font-semibold text-primary">
//           {i18n.language === 'ar' ? 'English' : 'العربية'}
//         </Text>
//       </TouchableOpacity>

//       <LanguageChangeOverlay visible={isChanging} />
//     </>
//   );
// }
