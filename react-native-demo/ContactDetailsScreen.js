import React from 'react';
import {StyleSheet, ScrollView, Dimensions, SafeAreaView} from 'react-native';
import {Lwc} from 'mobile-hybrid-sdk/react';

const ContactDetailScreen = ({route}) => {
  const attrs = {
    recordId: route.params.recordId,
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <Lwc
          style={styles.lwc}
          componentName="cfMobileContactDetails"
          lwcAttrs={attrs}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const {height, width} = Dimensions.get('window');

const styles = StyleSheet.create({
  lwc: {
    height,
    width,
  },
});

export default ContactDetailScreen;
