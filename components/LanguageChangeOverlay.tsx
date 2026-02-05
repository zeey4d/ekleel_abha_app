// import React from 'react';
// import { View, ActivityIndicator, Modal, Text } from 'react-native';
// import { useTranslation } from 'react-i18next';

// interface LanguageChangeOverlayProps {
//   visible: boolean;
// }

// export function LanguageChangeOverlay({ visible }: LanguageChangeOverlayProps) {
//   const { t } = useTranslation('common');

//   if (!visible) return null;

//   return (
//     <Modal
//       transparent
//       visible={visible}
//       animationType="fade"
//       statusBarTranslucent
//     >
//       <View className="flex-1 items-center justify-center bg-black/70">
//         <View className="items-center justify-center gap-4 rounded-xl bg-background p-8 shadow-lg">
//           <ActivityIndicator size="large" color="#000" />
//           <Text className="text-lg font-medium text-foreground">
//             {t('common:restarting', 'جاري إعادة التشغيل...')}
//           </Text>
//         </View>
//       </View>
//     </Modal>
//   );
// }
