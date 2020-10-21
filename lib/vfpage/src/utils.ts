import {
  CreateLwcInput,
  MobileMethod,
  RequestType,
  CallbackMap,
  CallbackInput,
} from './types';

/**
 * Generates LWC config from the url.
 */
export const lwcConfigFromUrl = (search: string): CreateLwcInput => {
  const encodedData = new URLSearchParams(search).get('data');
  const data = window.atob(window.decodeURIComponent(encodedData || ''));
  const {ns, vfns, component, props, refs, methods} = JSON.parse(data);

  return {
    ns,
    vfns,
    component,
    props,
    refs,
    methods,
  };
};

export const generateId = (callbacks: CallbackMap): string => {
  const id = `${Number(new Date())} ${Math.ceil(Math.random() * 10000000)}`;
  if (!callbacks.get(id)) {
    return id;
  }
  return generateId(callbacks);
};

export const promiseHandler = (
  resolve: (d: any) => void,
  reject: (e: string) => void,
) => (...props: CallbackInput) => {
  const [responseData, error] = props;
  if (error) {
    reject(error);
  } else {
    resolve(responseData);
  }
};

/**
 * Custom event dispatcher to the native app
 */
export const postMessageToNativeApp = (requestType: RequestType, data: any) => {
  /**
   *  Prepare data to be sent.
   */
  const postMessageData = {
    ...data,
    type: requestType,
  };
  const messageString = JSON.stringify(postMessageData);

  const win: any = window;

  /**
   * Will post message to ReactNative.
   */
  if (win.ReactNativeWebView) {
    win.ReactNativeWebView.postMessage(messageString);
  } else if (win.VlocApp && win.VlocApp.postMessage) {
    /**
     * Will post message to Android SDK.
     */
    win.VlocApp.postMessage(messageString);
  } else if (win.nativePostMessage) {
    /**
     * Will post message to iOS SDK.
     */
    win.nativePostMessage(messageString);
  } else {
    /**
     * Will post message to HTML - iframe.
     */
    win.parent.postMessage(postMessageData, '*');
  }
};

export const generateMobileMethods = (
  keys: string[] | null | undefined,
  callbacks: CallbackMap,
): MobileMethod | null => {
  if (!keys) {
    return null;
  }
  return keys.reduce((current: any, name: string) => {
    return {
      ...current,
      [name]: (...args: any) => {
        const callId = generateId(callbacks);
        const data = {
          callId,
          args,
          name,
        };

        /**
         * Send data to native.
         */
        postMessageToNativeApp('fnCall', data);

        return new Promise<any>((resolve, reject) => {
          /**
           * Save the resolver function.
           */
          callbacks.set(callId, promiseHandler(resolve, reject));
        });
      },
    };
  }, {});
};
