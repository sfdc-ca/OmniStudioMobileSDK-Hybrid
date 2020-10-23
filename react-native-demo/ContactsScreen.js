import React, {useState} from 'react';
import {
  Dimensions,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
  Text,
} from 'react-native';
import {Lwc} from 'mobile-hybrid-sdk/react';

import Fab from './Fab';

const ContactScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);

  /**
   * Postmessage event when the user selects a contact.
   */
  const onMessage = ({id}) => {
    if (id) {
      /**
       * Go to Contact details page with recordId as the parameter.
       */
      navigation.navigate('ContactDetails', {
        recordId: id,
      });
    }
  };

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

  return (
    <SafeAreaView>
      <ScrollView
        refreshControl={
          <RefreshControl onRefresh={onRefresh} refreshing={loading} />
        }>
        {!loading && (
          <Lwc
            componentName="cfMobileDemoContactCard"
            style={styles.lwc}
            onMessage={onMessage}
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

const {width, height} = Dimensions.get('window');
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
