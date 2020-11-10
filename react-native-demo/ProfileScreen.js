import React from 'react';
import {Dimensions, StyleSheet, SafeAreaView, ScrollView} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {Lwc, useSf} from 'mobile-hybrid-sdk/react';

const ProfileScreen = ({navigation}) => {
  const {sf} = useSf();
  const attrs = {
    user: sf.user,
  };

  const methods = {
    logout: () => {
      AsyncStorage.clear();
      sf.clearData();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Login',
          },
        ],
      });
    },
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Lwc
          componentName="mobileDemoProfile"
          methods={methods}
          lwcAttrs={attrs}
          style={styles.lwc}
          defaultNs
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const {width, height} = Dimensions.get('window');
const styles = StyleSheet.create({
  lwc: {
    width,
    height,
  },
});

export default ProfileScreen;
