import '@/global.css';
import '@/i18n/config';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import AppHeader from '@/components/navigation/AppHeader';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from '@/store/store';
import LanguageProvider from '@/providers/LanguageProvider';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';


export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
    const { setColorScheme } = useColorScheme();

useEffect(() => {
  setColorScheme('light');
}, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <LanguageProvider>
          <ThemeProvider value={NAV_THEME.light}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                header: (props: any) => <AppHeader {...props} />,
                headerShown: true,
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            </Stack>
            <PortalHost />
          </ThemeProvider>
        </LanguageProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}


// import '@/global.css';
// import '@/i18n/config';

// import { NAV_THEME } from '@/lib/theme';
// import { ThemeProvider } from '@react-navigation/native';
// import { PortalHost } from '@rn-primitives/portal';
// import { Stack } from 'expo-router';
// import AppHeader from '@/components/navigation/AppHeader';
// import { StatusBar } from 'expo-status-bar';
// import { useColorScheme } from 'nativewind';
// import { Provider } from 'react-redux';
// import { store } from '@/store/store';
// import LanguageProvider from '@/providers/LanguageProvider';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { GestureHandlerRootView } from "react-native-gesture-handler";


// export {
//   ErrorBoundary,
// } from 'expo-router';

// export default function RootLayout() {


//   return (
//     <SafeAreaView style={{ flex: 1 }}>
//       <LanguageProvider>
//         <Provider store={store}>
//           <ThemeProvider value={NAV_THEME.light}>
//             <StatusBar style="dark" />
//                 <GestureHandlerRootView style={{ flex: 1 }}>

//             <Stack
//               screenOptions={{
//                 header: (props: any) => <AppHeader {...props} />,
//                 headerShown: true,
//                 animation: 'slide_from_right',
//               }}
//             >
//               <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//             </Stack>
//             </GestureHandlerRootView>
//             <PortalHost />
//           </ThemeProvider>
//         </Provider>
//       </LanguageProvider>
//     </SafeAreaView>
//   );
// }

