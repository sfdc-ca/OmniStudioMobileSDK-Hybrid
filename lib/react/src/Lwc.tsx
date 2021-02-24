import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { WebView } from 'react-native-webview';

import { useSf } from './useSf';

type Props = {
  componentName: string;
  lwcAttrs?: Object;
  defaultNs?: boolean;
  vfpage?: string;
  vfns?: string;
  methods?: any;
  style?: any;
  frontDoor?: Boolean;
  webViewProps?: any;
  headers?: any;
  onMessage?: (data: any) => void;
  onMobileAction?: (data: any) => void;
  onOmniscriptApiResponse?: (data: any, response: any) => void;
  onOmniscriptCancel?: (data: any) => void;
  onOmniscriptEvent?: (data: any) => void;
  onOmniscriptMessage?: (data: any) => void;
  /** Emitted once the lwc has successfully loaded on the vfpage */
  onLwcLoad?: () => void;
  refs?: string[];
  ref?: any;
};

const Lwc: React.FC<Props> = forwardRef(
  (
    {
      componentName,
      lwcAttrs,
      vfpage,
      defaultNs = false,
      vfns = null,
      methods = {},
      style,
      frontDoor = false,
      webViewProps = {},
      headers = {},
      onMessage,
      onMobileAction,
      onOmniscriptApiResponse,
      onOmniscriptCancel,
      onOmniscriptEvent,
      onOmniscriptMessage,
      onLwcLoad,
      refs,
    },
    ref
  ) => {
    const lwcEl = useRef();
    const { sf }: any = useSf();

    useImperativeHandle(ref, () => ({
      /**
       * Set attrbiute of the target element inside the lwc.
       */
      setElementProps: (element: any, props: any) => {
        (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'setelementprops',
            target: [
              {
                element,
                props,
              },
            ],
          })
        );
      },

      /**
       * Set the attribute of the lwc.
       */
      setProps: (props: any) => {
        (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'setprops',
            props,
          })
        );
      },

      /**
       * Explicitly send an error message to the lwc.
       */
      sendError: (message: any, callId: any) => {
        (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'error',
            callId,
            message,
          })
        );
      },

      runAction: (data: any) => {
        (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'runaction',
            data,
          })
        );
      },

      reload: (data: any) => {
        (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'reload',
            data,
          })
        );
      },
    }));

    /**
     * Creates the VFPage LWC URI.
     */
    const uri = sf.lwcUri(
      {
        componentName,
        lwcAttrs,
        defaultNs,
        vfns,
        methods: Object.keys(methods),
        refs,
      },
      vfpage
    );

    /**
     * Webview Source for the WebView component
     */
    const source = {
      uri: frontDoor ? sf.frontDoor(uri) : uri,
      headers,
    };

    /**
     * Callback for the WebView postMessage from the vfpage.
     *
     * @param {*} event Postmessage event
     */
    const viewOnMessage = async (event: any) => {
      /**
       * Postmessage event data from the Webview.
       */
      const eventData: {
        args: any;
        type: string;
        callId: string;
        name: string;
      } =
        (() => {
          try {
            return JSON.parse(event.nativeEvent.data);
          } catch (e) {
            return event.nativeEvent.data;
          }
        })() || {};

      const callbackParams = {
        data: eventData,

        /**
         * Arguments passed by the lwc.
         */
        params: eventData.args || {},

        event: event.nativeEvent,

        /**
         * Automatically get the id from the arguments and
         * assign it to the id field for better developer
         * experience.
         */
        id: (eventData.args || {}).id,
      };

      /**
       * Fires the onMessage callback.
       */
      if (onMessage) {
        onMessage(callbackParams);
      }

      /**
       * Callback for the loaded event. The event is
       * triggered once the LWC has successfully
       * loaded.
       */
      if (onLwcLoad && eventData.type === 'loaded') {
        onLwcLoad();
      }

      /**
       * Handle mobileaction post message.
       */
      if (onMobileAction && eventData.type === 'mobileAction') {
        onMobileAction(callbackParams);
      }

      /**
       * Handle omniscriptevent post message.
       */
      if (eventData.type === 'omniscriptEvent' && onOmniscriptEvent) {
        onOmniscriptEvent(callbackParams);
      }

      /**
       * Handle omniscriptEvent post message.
       */
      if (
        eventData.type === 'omniscriptEvent' &&
        onOmniscriptApiResponse &&
        callbackParams.params.apiResponse
      ) {
        onOmniscriptApiResponse(
          callbackParams.params.apiResponse,
          callbackParams
        );
      }

      /**
       * Handle omniscript post message.
       */
      if (eventData.type === 'omniPostMessage') {
        if (onOmniscriptMessage) {
          onOmniscriptMessage(callbackParams);
        }

        /**
         * Handle omniscript cancel.
         */
        if (
          onOmniscriptCancel &&
          callbackParams.params.OmniEleName === 'CANCEL'
        ) {
          onOmniscriptCancel(callbackParams);
        }
      }

      /**
       * Handle callback request from the LWC. This means that
       * the request is calling a function from the methods
       * object.
       */
      if (eventData.type === 'fnCall') {
        const fn = methods[eventData.name];

        /**
         * Security check to validate if the
         * function is exsiting on the
         * methods object.
         */
        if (!fn) {
          return false;
        }

        /**
         * Response of the method call.
         */
        let response = null;

        /**
         * Arguments to be passed on the function.
         * eventData is the default argument to
         * be passed.
         */
        const functionParams = (eventData.args || []).concat(eventData);

        /**
         * If the function is async or a promise, wait for it to resolve.
         */
        if (fn.constructor.name === 'AsyncFunction' || fn instanceof Promise) {
          response = await fn.apply(null, functionParams);
        } else {
          /**
           * Handle regular javascript function.
           */
          const res = fn.apply(null, functionParams);

          /**
           *  Check if the "result" of the function call is a Promise.
           * If it is a Promise, wait for it to resolve.
           */
          if (res instanceof Promise) {
            response = await res;
          } else {
            response = res;
          }
        }

        /**
         * Send response data back to the iframe after getting
         * the result from the function call.
         */
        return (lwcEl.current as any).postMessage(
          JSON.stringify({
            type: 'callback',
            callId: eventData.callId,
            response,
          })
        );
      }
    };

    return (
      <WebView
        ref={lwcEl}
        style={style}
        source={source}
        onMessage={viewOnMessage}
        {...webViewProps}
      />
    );
  }
);

export default Lwc;
