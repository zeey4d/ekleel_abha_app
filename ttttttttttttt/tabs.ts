// import React, { useEffect, useState } from 'react';
// import { Tabs } from '@/components/ui/tabs';
// import { Icon } from '@/components/ui/icon';
// import { HomeIcon, GridIcon, ShoppingCartIcon, HeartIcon, UserIcon } from 'lucide-react-native';
// import { View, I18nManager } from 'react-native';
// import { useTranslation } from 'react-i18next';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import '@/i18n/config';

// const ACTIVE_TAB_KEY = '@active_tab';

// export default function TabsLayout() {
//   const [value, setValue] = React.useState('home');
//   const [isRTL, setIsRTL] = useState(I18nManager.isRTL);
//   const { t, i18n } = useTranslation('tabs');

//   // Load saved active tab on mount
//   useEffect(() => {
//     const loadActiveTab = async () => {
//       try {
//         const savedTab = await AsyncStorage.getItem(ACTIVE_TAB_KEY);
//         if (savedTab) {
//           setValue(savedTab);
//         }
//       } catch (error) {
//         console.error('Error loading active tab:', error);
//       }
//     };

//     loadActiveTab();
//   }, []);

//   // Listen for language changes and update RTL state
//   useEffect(() => {
//     const handleLanguageChange = () => {
//       setIsRTL(I18nManager.isRTL);
//     };

//     i18n.on('languageChanged', handleLanguageChange);

//     return () => {
//       i18n.off('languageChanged', handleLanguageChange);
//     };
//   }, [i18n]);

//   // Save active tab when it changes
//   const handleTabChange = async (newValue: string) => {
//     setValue(newValue);
//     try {
//       await AsyncStorage.setItem(ACTIVE_TAB_KEY, newValue);
//     } catch (error) {
//       console.error('Error saving active tab:', error);
//     }
//   };

//   const tabs = [
//     {
//       value: 'home',
//       title: t('Home'),
//       icon: (
//         <Icon
//           as={HomeIcon}
//           size={22}
//           className={value === 'home' ? 'text-primary' : 'text-muted-foreground'}
//         />
//       ),
//       content: require('./index').default,
//     },
//     {
//       value: 'Categories',
//       title: t('Categories'),
//       icon: (
//         <Icon
//           as={GridIcon}
//           size={22}
//           className={value === 'Categories' ? 'text-primary' : 'text-muted-foreground'}
//         />
//       ),
//       content: require('./categories').default,
//     },
//     {
//       value: 'cart',
//       title: t('Shopping Cart'),
//       icon: (
//         <Icon
//           as={ShoppingCartIcon}
//           size={22}
//           className={value === 'cart' ? 'text-primary' : 'text-muted-foreground'}
//         />
//       ),
//       content: require('./cart').default,
//     },
//     {
//       value: 'wishlist',
//       title: t('Wishlist'),
//       icon: (
//         <Icon
//           as={HeartIcon}
//           size={22}
//           className={value === 'wishlist' ? 'text-primary' : 'text-muted-foreground'}
//         />
//       ),
//       content: require('./wishlist').default,
//     },
//     {
//       value: 'Account',
//       title: t('Account'),
//       icon: (
//         <Icon
//           as={UserIcon}
//           size={22}
//           className={value === 'profile' ? 'text-primary' : 'text-muted-foreground'}
//         />
//       ),
//       content: require('./account').default,
//     },
//     //       <Tabs.Screen
// //         name="(shop)"
// //         options={{
// //           href: null, // Hide from tab bar
// //         }}
// //       />
//   ];

//   return (
//     <View
//       className="flex-1 bg-background"
//       style={{
//         direction: isRTL ? 'rtl' : 'ltr',
//       }}>
//       <Tabs
//         tabs={tabs.map((tab) => ({
//           ...tab,
//           content: React.createElement(tab.content),
//         }))}
//         value={value}
//         onValueChange={handleTabChange}
//         className="flex-1"
//       />
//     </View>
//   );
// }
