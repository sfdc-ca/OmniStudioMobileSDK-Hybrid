import React from 'react';
import {ScrollView, StyleSheet, Dimensions} from 'react-native';

import {Lwc} from 'mobile-hybrid-sdk/react';

const CardDemoScreen = () => {
  const methods = {
    getEmail: () => 'hello@world.com',
    getText: (x, y, z) => `${x} ${y} ${z.appendThis}`,
  };

  return (
    <ScrollView>
      <Lwc
        componentName="testDoneEnglish"
        methods={methods}
        style={styles.webView}
      />
    </ScrollView>
  );
};

// Styles related block
const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default CardDemoScreen;
