import Contacts from 'react-native-contacts';
/**
 * This will verify if the app has permission to the Contacts.
 */
export const checkPermission = async () => {
  try {
    await Contacts.getPermission();
  } catch (e) {
    try {
      await Contacts.requestPermission();
    } catch (e) {
      // Do nothing
    }
  }
};

export const profileQuery = (id) => {
  return `SELECT Id, Email, Username, FirstName, LastName, Name, SmallPhotoUrl  FROM User WHERE Id = '${id}'`;
};
