import Contacts from 'react-native-contacts';
/**
 * This will verify if the app has permission to the Contacts.
 */
export const checkPermission = () => {
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
};
