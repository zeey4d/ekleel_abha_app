import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const RestartSplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/splash.png')} 
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#ffffff', // Or your splash background color
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999, // Ensure it sits on top of everything
    width,
    height,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default RestartSplashScreen;
