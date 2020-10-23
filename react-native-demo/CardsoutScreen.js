import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Dimensions} from 'react-native';

import {CardsOut} from 'mobile-hybrid-sdk/react';

const CardsoutScreen = () => {
  const layout = 'campaign-detail';
  const layoutId = 'a1L6A000001a5ZiUAI';
  const ns = 'c';
  const params = {
    id: '7013u000000TrdBAAS',
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <CardsOut
          layout={layout}
          layoutId={layoutId}
          ns={ns}
          style={styles.webView}
          params={params}
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

export default CardsoutScreen;
