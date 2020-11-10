import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Modal,
  StyleSheet,
  View,
} from "react-native";
import { Lwc } from "mobile-hybrid-sdk/react";

import Contacts from "react-native-contacts";
import { checkPermission } from "./utils";
import ContactList from "./ContactList";

let resolver = null;

const promiseContainer = () => {
  return new Promise((resolve) => {
    resolver = resolve;
  });
};

const AddContactScreen = ({ navigation }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [contacts, setContacts] = useState([]);

  const handleFetchContact = () => {
    checkPermission().then(() => {
      Contacts.getAll((err, contacts) => {
        if (err) {
          return console.log(err);
        }
        /**
         * If app has permission, Open the
         * contact selection modal.
         */
        setContacts(contacts);
        setIsOpen(true);
      });
    });

    /**
     * Wait for the user to select a contact.
     */
    return promiseContainer().then((data) => {
      /**
       * Close the modal.
       */
      setIsOpen(false);

      /**
       * Return the data back to the lwc.
       */
      return data;
    });
  };

  const onOmniscriptCancel = () => navigation.goBack();

  /**
   * Listen for Dataraptor api.
   */
  const onOmniscriptApiResponse = (apiResponse) => {
    /**
     * Check for successful apiResponse.
     */
    if (!apiResponse.DRId_Contact) {
      return false;
    }
    /**
     * Go to Contact details page using the DRID_Contact as the recordId.
     */
    navigation.replace("ContactDetails", {
      recordId: apiResponse.DRId_Contact,
    });
  };

  /**
   * User selects a Contact from the modal.
   */
  const onContactSelect = (contact) => resolver(contact);

  const methods = {
    fetchContact: () => handleFetchContact(),
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Lwc
          style={styles.lwc}
          componentName="mobileAddcontactEnglish"
          methods={methods}
          onOmniscriptApiResponse={onOmniscriptApiResponse}
          onOmniscriptCancel={onOmniscriptCancel}
        />
      </ScrollView>
      <Modal visible={isOpen} animationType="slide" transparent={true}>
        {isOpen && (
          <View style={styles.modal}>
            <ContactList
              contacts={contacts}
              onContactSelect={onContactSelect}
            />
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  lwc: {
    width,
    height,
  },
  modal: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
});

export default AddContactScreen;
