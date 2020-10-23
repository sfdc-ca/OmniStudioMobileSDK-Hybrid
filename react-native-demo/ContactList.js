import React from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {Lwc} from 'mobile-hybrid-sdk/react';

const ContactList = ({onContactSelect, contacts}) => {
  const methods = {
    selectContact: (contact) => {
      onContactSelect(contact);
    },
  };
  const attrs = {
    contacts,
  };

  return (
    <View style={styles.root}>
      <Text style={styles.text}>Select a Contact</Text>
      <Lwc
        style={styles.lwc}
        componentName="mobileNativeContactList"
        methods={methods}
        lwcAttrs={attrs}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: 340,
    height: 500,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,

    elevation: 5,
    borderRadius: 12,
  },
  lwc: {
    width: 340,
    height: 500,
    borderRadius: 12,
  },
  text: {
    alignSelf: 'center',
    marginVertical: 12,
    color: '#565656',
  },
});

export default ContactList;
