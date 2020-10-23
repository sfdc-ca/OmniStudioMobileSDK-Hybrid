import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Dimensions} from 'react-native';

import {Omniout} from 'mobile-hybrid-sdk/react';

const OmnioutScreen = () => {
  const omniScriptType = 'test';
  const subType = 'done';
  const language = 'english';

  const onMessage = (event) => {
    console.log('Omniout Event', event);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Omniout 
          omniScriptType={omniScriptType}
          subType={subType}
          language={language}
          style={styles.webView}
          onMessage={onMessage}
        />
      </ScrollView>
    </SafeAreaView>
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

export default OmnioutScreen;
