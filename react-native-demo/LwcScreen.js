import React, {useState, useRef} from 'react';
import Contacts from 'react-native-contacts';
import {Button, SafeAreaView, ScrollView, StyleSheet, Dimensions, Alert} from 'react-native';

import {Lwc} from 'mobile-hybrid-sdk/react';
import graphConfig from './graphConfig';

const LwcScreen = ({navigation}) => {
  const lwcElement = useRef();
  const [isOpen, setIsOpen] = useState();
  const [lwcAttrs, setLwcAttrs] = useState({
    greeter: 'Foo'  
  });
  // const componentName = 'cfCardDemoTwo';
  const componentName = 'testDoneEnglish'; // Demo
  // const componentName = 'nxgPropsDemo'; // Demo
  // const componentName = 'graph'; // Relationship graph
  const defaultNs = true; // Set true for digital commerce
  // const componentName = 'dcSampleApp'; // Digital Commerce LWC
  // const lwcAttrs = graphConfig; // Relationship Graph LWC Attrs

  /**
   * This will verify if the app has permission to the Contacts.
   */
  const checkPermission = () => {
    return new Promise((resolve, reject) => {
      Contacts.checkPermission((err, permission) => {
        if (err) {
          return reject(err);
        }
        if (permission === 'undefined') {
          return Contacts.requestPermission((err, p) => {
            if (err) {
              reject(err);
            } else {
              resolve(p);
            }
          });
        }
        if (permission === 'authorized') {
          return resolve(permission);
        }
        return reject('Not Available');
      });
    });
  }

  /**
   * Functions that are exposed to the LWC.
   * These functions are called 
   * from the LWC.
   */
  const methods = {
    postMessage: () => {
      Alert.alert('ok');
    },
    getAllContacts: () => {
      return new Promise((resolve, reject) => {
        checkPermission().then(() => {
          Contacts.getAll((err, contacts) => {
            if (err) {
              reject(err);
            }
            resolve(contacts);
          })
        });
      });
    }
  };

  // const press = () => {
  //   lwcElement.current.setProps({
  //     greeter: 'Hello World!'
  //   });
  // };

  const press = () => {
    lwcElement.current.setElementProps([{
      element: ['c-omniscript-email', 'c-input'],      
      props: {
        value: 'hello_from_client_code@email.com'
      },
    }]);
  };

  const onMessage = (eventData) => {
    console.log(eventData.name, eventData);
    if (eventData && eventData.name === 'omniactionbtn') {
      checkPermission().then(() => {
        Contacts.getAll((err, contacts) => {
          if (err) {
            return console.log(err);
          }
          /**
           * Equivalent to postmessage. Will post contacts data to
           * the omniButton lwc.
           */
          lwcElement.current.setElementProps([{
            element: ['c-omni-button'],
              props: {
                contacts,
              }
            }]);
        })
      })
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <Button title="Test set props" onPress={press}/>
        <Lwc
          ref={lwcElement}
          componentName={componentName}
          lwcAttrs={lwcAttrs}
          methods={methods}
          style={styles.webView}
          onMessage={onMessage}
          defaultNs
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

export default LwcScreen;
