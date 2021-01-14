import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Text,
} from 'react-native';
import { Lwc } from 'omni-studio-mobile-sdk-react';

import Fab from './Fab';

const ContactScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);

  const goToAddContact = () => {
    navigation.navigate('AddContact');
  };

  const onRefresh = () => {
    if (loading) {
      return false;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const methods = {
    goToDetail: (recordId) => {
      navigation.navigate('ContactDetails', {
        recordId,
      });
    },
  };

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={loading} />
        }
      >
        {!loading && (
          <Lwc
            componentName="cfMobileDemoContactCard"
            methods={methods}
            style={styles.lwc}
            frontDoor
            defaultNs
          />
        )}
      </ScrollView>
      <Fab onPress={goToAddContact}>
        <Text style={styles.text}>+</Text>
      </Fab>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get('window');
const styles = StyleSheet.create({
  lwc: {
    width,
    height: height - 167,
  },
  text: {
    fontSize: 30,
    color: 'white',
  },
});

export default ContactScreen;
