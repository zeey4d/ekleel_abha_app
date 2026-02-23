import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';

const { width, height } = Dimensions.get('window');

/**
 * Full-screen overlay shown while the app is restarting
 * after a language / RTL direction change.
 */
const RestartSplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Image
        source={require('@/assets/images/aka_g.png')}
        style={styles.image}
        resizeMode="contain"
      />

      {/* Loading indicator + message */}
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#6366f1" />
        <Text style={styles.text}>جاري تغيير اللغة...</Text>
        <Text style={styles.subtext}>Changing language...</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    width,
    height,
  },
  image: {
    width: '60%',
    height: '40%',
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginTop: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#94a3b8',
  },
});

export default RestartSplashScreen;
