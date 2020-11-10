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
 * @param {function} lwcProps.onMessage
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
    const { sf } = useSf();

    useImperativeHandle(ref, () => ({
      setElementProps: (element, props) => {
        lwcEl.current.postMessage(
          JSON.stringify({
            type: "setelementprops",
            target: [
              {
                element,
                props,
              },
            ],
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
      sendError: (message, callId) => {
        lwcEl.current.postMessage(
          JSON.stringify({
            type: "error",
            callId,
            message,
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
      const eventData =
        (() => {
          try {
            return JSON.parse(event.nativeEvent.data);
          } catch (e) {
            return event.nativeEvent.data;
          }
        })() || {};

      const callbackParams = {
        data: eventData,
        params: eventData.args || {},
        event: event.nativeEvent,
        id: (eventData.args || {}).id,
      };

      if (onMessage) {
        onMessage(callbackParams);
      }

      if (onLwcLoad && eventData.type === "loaded") {
        onLwcLoad();
      }

      /**
       * Handle mobileaction message.
       */
      if (onMobileAction && eventData.type === "mobileAction") {
        onMobileAction(callbackParams);
      }

      if (eventData.type === "omniscriptEvent" && onOmniscriptEvent) {
        onOmniscriptEvent(callbackParams);
      }

      if (
        eventData.type === "omniscriptEvent" &&
        onOmniscriptApiResponse &&
        callbackParams.params.apiResponse
      ) {
        onOmniscriptApiResponse(
          callbackParams.params.apiResponse,
          callbackParams
        );
      }

      /**
       * Handle omniscript message.
       */
      if (eventData.type === "omniPostMessage") {
        if (onOmniscriptMessage) {
          onOmniscriptMessage(callbackParams);
        }

        if (
          onOmniscriptCancel &&
          callbackParams.params.OmniEleName === "CANCEL"
        ) {
          onOmniscriptCancel(callbackParams);
        }
      }

      if (eventData.type === "fnCall") {
        const fn = methods[eventData.name];

        if (!fn) {
          return false;
        }

        // Handles async function
        let response = null;
        const functionParams = (eventData.args || []).concat(eventData);
        if (fn.constructor.name === "AsyncFunction") {
          response = await fn.apply(null, functionParams);
        }

        // Handles Promise type
        else if (fn instanceof Promise) {
          response = await fn.apply(null, functionParams);
        }

        // A regular javascript function
        else {
          const res = fn.apply(null, functionParams);
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
