import React from 'react';
import {View, StyleSheet} from 'react-native';
import LottieView from 'lottie-react-native';

const LoadingView = () => {
  return (
    <View style={styles.root}>
      <LottieView
        source={require('./assets/7887-loader-blue.json')}
        style={styles.loader}
        autoPlay
        loop
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loader: {
    width: 100,
  },
});

export default LoadingView;
