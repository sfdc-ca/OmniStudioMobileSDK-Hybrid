import React, {useRef} from 'react';
import {ScrollView, StyleSheet, Dimensions} from 'react-native';

import {Lwc} from 'mobile-hybrid-sdk/react';

const CustomEventDemo = () => {
  const lwcElem = useRef();

  const onMobileAction = () => {
    lwcElem.current.setElementProps([
      {
        element: 'c-omniscript-email c-input',
        props: {
          value: 'customevent@mail.com',
        },
      },
    ]);
  };

  return (
    <ScrollView>
      <Lwc
        ref={lwcElem}
        style={styles.webView}
        componentName="testDoneEnglish"
        onMobileAction={onMobileAction}
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

export default CustomEventDemo;
