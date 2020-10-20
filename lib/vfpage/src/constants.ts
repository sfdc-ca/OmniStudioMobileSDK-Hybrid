/**
 * All the available omniscript lwc custom events.
 */
export const omniEvents = [
  'omniactiondebug',
  'omniactionbtn',
  'omniaggregate',
  'omniautoadvance',
  'omnicustomsavestate',
  'omnifileuploaded',
  'omniformatteddata',
  'omniinvalid',
  'omnimodal',
  'omnipendingupdates',
  'omnirefreshseeddata',
  'omnisavedforlater',
  'omnisaveforlater',
  'omnisetinit',
  'omnisetlookupoptions',
  'omnisetoptions',
  'omnisetshow',
  'omnistepchange',
  'omnistepchart',
  'omniupdatejsondef',
  'omnivalid',
];

/**
 * Types of requests that the postmessage can execute to native.
 */
export const requestTypes = {
  loaded: 'loaded',
  fnCall: 'fnCall',
};

export const errorMessageEl = '#auraErrorMessage';

export const nativeRequest = {
  setProps: 'setprops',
  setElementProps: 'setelementprops',
  callback: 'callback',
  reload: 'reload',
  error: 'error',
};
