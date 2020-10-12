import React, { useRef, forwardRef, useImperativeHandle } from "react";
import { WebView } from "react-native-webview";

import { useSf } from "./useSf";

/**
 * @param {Object} lwcProps
 * @param {string} lwcProps.componentName lwc name
 * @param {Object} lwcProps.lwcAttrs lwc attributes
 * @param {string} lwcProps.vfpage
 * @param {boolean} lwcProps.defaultNs
 * @param {string} lwcProps.vfns string
 * @param {Object[]} lwcProps.methods
 * @param {Object} lwcProps.style
 * @param {boolean} lwcProps.frontDoor
 */
const Lwc = forwardRef(
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
      onOmniscriptMessage,
      refs,
    },
    ref
  ) => {
    const lwcEl = useRef();
    const { sf } = useSf();

    useImperativeHandle(ref, () => ({
      setElementProps: (target) => {
        lwcEl.current.postMessage(
          JSON.stringify({
            type: "setelementprops",
            target,
          })
        );
      },
      setProps: (attrs) => {
        lwcEl.current.postMessage(
          JSON.stringify({
            type: "setprops",
            props: attrs,
          })
        );
      },
    }));

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

    // Source for the WebView component
    const source = {
      uri: frontDoor ? sf.frontDoor(uri) : uri,
      headers,
    };

    const viewOnMessage = async (event) => {

      const eventData = (() => {
        try {
          return JSON.parse(event.nativeEvent.data);
        } catch (e) {
          return event.nativeEvent.data;
        }
      })();

      if (onMessage) {
        onMessage(eventData, event.nativeEvent);
      }

      /**
       * Handle mobileaction message.
       */
      if (onMobileAction && eventData.name === 'mobileaction' && eventData.callId === 'mobileaction') {
        onMobileAction(eventData, event.nativeEvent);
      }

      /**
       * Handle omniscript message.
       */
      if (onOmniscriptMessage && (
        eventData.name === 'omnipostmessage' && eventData.callId === 'omnipostmessage') ||
        eventData.callId === 'omniscript'
      ) {
        onOmniscriptMessage(eventData, event.nativeEvent);
      }

      if (eventData.type === "fnCall") {
        const fn = methods[eventData.name];

        if (!fn) {
          return false;
        }

        // Handles async function
        let response = null;
        if (fn.constructor.name === "AsyncFunction") {
          response = await fn.apply(null, eventData.args || [eventData]);
        }

        // Handles Promise type
        else if (fn instanceof Promise) {
          console.log("IS PROMISE");
          response = await fn.apply(null, eventData.args || [eventData]);
        }

        // A regular javascript function
        else {
          const res = fn.apply(null, eventData.args || [eventData]);
          if (res instanceof Promise) {
            response = await res;
          } else {
            response = res;
          }
        }
        // Send response data back to the iframe
        lwcEl.current.postMessage(
          JSON.stringify({
            type: "callback",
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
