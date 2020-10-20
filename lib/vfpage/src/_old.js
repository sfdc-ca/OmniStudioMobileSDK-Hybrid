/**
       * All the available omniscript lwc custom events.
       */
const omniEvents = [
  "omniactiondebug",
  "omniactionbtn",
  "omniaggregate",
  "omniautoadvance",
  "omnicustomsavestate",
  "omnifileuploaded",
  "omniformatteddata",
  "omniinvalid",
  "omnimodal",
  "omnipendingupdates", 
  "omnirefreshseeddata",
  "omnisavedforlater",
  "omnisaveforlater",
  "omnisetinit",
  "omnisetlookupoptions",
  "omnisetoptions",
  "omnisetshow",
  "omnistepchange",
  "omnistepchart",
  "omniupdatejsondef",
  "omnivalid",
];

/**
 * function placeholder for the saveRefsAndMethods
 */
let refreshRefMethods = null;

/**
 * Save the original refs and methods, and then also add additional refs.
 */
const saveRefsAndMethods = (refs, methods) => (addedRefs) => {
  applyMethodsToRefs(refs.concat(addedRefs), methods);
};

let iframeId = "";
let lwcElement = null;
const errElem = document.querySelector("#auraErrorMessage");

/**
 * A Map storage for function calls/external method calls.
 * This is safer than Object literals, to prevent
 * accidental mutations.
 */
const callBacks = new Map();

/**
 * Stores a resolver function that will run later once the
 * postmessage from native calls this function.
 */
const curry = (resolverFunction, rejectFunction) => (responseValue, error) => {
  if (error) {
    rejectFunction(error);
  } else {
    resolverFunction(responseValue);
  }
}

/**
 * Types of requests that the postmessage can execute to native.
 */
const requestTypes = {
  loaded: "loaded",
  fnCall: "fnCall",
};

/**
 * Toggle(show/hide) spinner element helper
 */
const spinnerUtil = () => {
  const el = document.getElementById("loading");
  const toggle = (styleName) => {
    el.style.display = styleName;
  };
  return {
    show: () => toggle("block"),
    hide: () => toggle("none"),
  };
};

/**
 * Custom event dispatcher to the native app
 */
const postMessageToNativeApp = (reqType, data) => {
  /**
   *  Prepare data to be sent.
   */
  const postMessageData = {
    ...data,
    type: reqType,
    id: iframeId,
  };

  /**
   * Will post message to ReactNative.
   */
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(
      JSON.stringify(postMessageData)
    );
  } else if (window.VlocApp && window.VlocApp.postMessage) {
    /**
     * Will post message to Android SDK.
     */
    window.VlocApp.postMessage(JSON.stringify(postMessageData));
  } else if (window.nativePostMessage) {
    /**
     * Will post message to iOS SDK.
     */
    window.nativePostMessage(JSON.stringify(postMessageData));
  } else {
    /**
     * Will post message to HTML - iframe.
     */
    window.parent.postMessage(postMessageData, "*");
  }
};

/**
 * Adds lwc component to dom
 */
const createLwc = (ns, vfns, name, props, successCb) => {
  $Lightning.use(`${vfns || ns}:ltngOutVF`, function () {
    $Lightning.createComponent(
      `${ns}:${name}`,
      props,
      "lightning",
      function (cmp, status) {
        if (status === "SUCCESS") {
          successCb(cmp);
        }
      }
    );
  });
};

/**
 * Main LWC handler
 * @param {Object} additionalProps - props to add to the lwc element.
 */
const initLwc = (additionalProps) => {
  /**
   * Convert url query to javascript object
   * Parse # and space to url encoding
   * Remove extra string characters
   */
  const urlParams = JSON.parse(
    window.decodeURIComponent(
      window.location.search
        .replace("?data=", "")
        .replace(/%23/g, "#")
        .replace(/%2523/g, "#")
        .replace(/%2B/g, " ")
        .replace(/%252B/g, " ")
        .replace("&sdtd=1", "")
    )
  );

  /**
   * Set the iframe id
   */
  iframeId = urlParams.iframeId;

  /**
   * Get the params for the component
   * 'c' is the default lwc component prefix
   */
  const ns = urlParams.ns || "c";
  const lwcComponentName = urlParams.lwc;
  const vfns = urlParams.vfns;
  const mobileMethods = mobileMethodsFn(urlParams.methods);
  // const mobileMethods = mobileMethodsFn(['fromParams']);

  /**
   * Remove object fields that are not
   * to be passed in the component.
   */
  delete urlParams.ns;
  delete urlParams.lwc;
  delete urlParams.vfns;

  /**
   * Props to be passed on the lwc
   */
  const lwcProps = {
    ...urlParams,
  };

  /**
   * Initiate spinner handler
   */
  const spinner = spinnerUtil();
  spinner.show();
  createLwc(
    ns,
    vfns,
    lwcComponentName,
    { ...lwcProps, ...(additionalProps || {}) },
    (cmp) => {
      // If lwc load succesfully, making sure error div is empty
      spinner.hide();
      errElem.innerHTML = "";

      /**
       * lwcElement is the root lwc.
       */
      lwcElement = cmp.elements[0];
      lwcElement.mobileMethods = mobileMethods;

      handleCustomEvents();
      postMessageToNativeApp(requestTypes.loaded, { status: "loaded" });
      applyMethodsToRefs(urlParams.refs, mobileMethods);
      refreshRefMethods = saveRefsAndMethods(urlParams.refs || [], mobileMethods);
    }
  );
};

/**
 * @param {string[][] | string[]} refs element names to add the mobileMethods to
 * @param {Object<Promise>} mobileMethods
 */
function applyMethodsToRefs(refs, mobileMethods) {
  if (!refs || !refs.length) {
    return false;
  }
  const refArray = refs.map((item) => {
    return {
      element: item,
      props: { mobileMethods },
    };
  });

  /**
   * Wait for 1sec to make sure that all elements are loaded.
   */
  setTimeout(() => {
    setTargetElementProps(refArray);
  }, 1000);
}

/**
 * Initializes all the custom event handlers.
 * Will listen to custom events and then convert it to postMessage.
 */
function handleCustomEvents() {
  omniEvents.forEach((eventItem) => {
    lwcElement.addEventListener(eventItem, (e) => {
      postMessageToNativeApp(requestTypes.fnCall, {
        name: eventItem,
        args: e.detail,
        callId: "omniscript",
      });
    });
  });

  /**
   * mobileaction is the only supported custom event if you want
   * to communicate with the native app.
   */
  lwcElement.addEventListener("mobileaction", (e) => {
    postMessageToNativeApp(requestTypes.fnCall, {
      name: "mobileaction",
      args: e.detail,
      callId: "mobileaction",
    });
  });

  /**
   * Re-initialize adding of mobile methods to reference elements.
   */
  lwcElement.addEventListener("initmobilemethods", (e) => {
    refreshRefMethods(e.detail || []);
  });
}

/**
 * Generates an Object from method names that was passed to the iframe.
 * Each field has postMessage integration.
 *
 * @param {Array<string>} keys;
 * @returns {Object}
 */
function mobileMethodsFn(keys) {
  return (keys || []).reduce(
    (c, n) => ({
      ...c,
      [n]: function () {
        const args = Array.from(arguments);
        const callId = `${Number(new Date())} ${Math.ceil(Math.random() * 10000000)}`;

        postMessageToNativeApp(requestTypes.fnCall, {
          name: n,
          args,
          callId,
        });

        return new Promise((resolve, reject) => {
          /**
           * Save the resolver function.
           */
          const applyCurry = curry(resolve, reject);
          /**
           * Store in the Map to use later by the postMessage handler.
           */
          callBacks.set(callId, applyCurry);
        });
      },
    }),
    {}
  );
}

/**
 * Reloads the lwc.
 * 
 * @param {Object} param.props Object literal to apply as props on the lwc.
 */
function reloadLwc(props) {
  const lwcWrapper = document.getElementById("lightning");
  lwcWrapper.innerHTML = "";
  initLwc(props || {});
}

/**
 * @param {Object} param.props Object literal of props you want to set on your root lwc element.
*/
function setProps(props) {
  Object.keys(props).forEach((propName) => {
    lwcElement[propName] = props[propName];
  });
}

/**
 * Converts query selector to array.
 */
function strQueryToArray(target) {
  if (Array.isArray(target)) {
    return target;
  }
  /*
  * Due to url encoding, spaces are converted to +.
  */
  return target.replace(/\+/, ' ').split(' ');
}

/*
 * @typedef {Object} SetElementItem
 * @property {string | string[]} element html element to apply the props to.
 * @property {Object} props an object literal data to apply  on the target element.
 * 
 * @params {SetElementItem[]} target
*/
function setTargetElementProps(target) {

  target.forEach((item) => {

    /**
     * Get the target child element.
     */
    const itemElement = strQueryToArray(item.element);

    const targetElement = itemElement.reduce((currentValue, nextValue) => {
      if (currentValue.shadowRoot) {
        return currentValue.shadowRoot.querySelector(nextValue);
      }
      return currentValue.querySelector(nextValue);
    }, lwcElement.shadowRoot);

    /**
     * Lwc child element.
     */
    if (targetElement) {
      /**
       * Apply to target element properties.
       */
      const p = Object.keys(item.props).forEach((d) => {
        targetElement[d] = item.props[d];
      });

      /**
       * targetelement is an input element, the hack is to
       * explicitly focus on that element, and then blur it.
       * Usuful on omniscripts since it only listens on blur
       * event to update the json data.
       */
      if (targetElement.focus) {
        targetElement.focus();
        setTimeout(() => targetElement.blur(), 0);
      }
    }
  });
}

function handleOmnisriptMessaging(event) {
  if (event.detail.refs || event.detail.OmniEleType === 'Step') {
    refreshRefMethods(JSON.parse(event.detail.refs || '[]'));
  }
}

/**
 * Initialize the lwc.
 */
initLwc();

/**
 * PostMessage handler from the local lwc and from the native app.
 */
(() => {
  window.addEventListener("message", (event) => {
    /**
     * Custom event generated by lwc omniscript from their Messaging framework.
     * It always includes OmniEleName.
     */
    if (event.detail && event.detail.OmniEleName) {
      handleOmnisriptMessaging(event);
      return postMessageToNativeApp("omnipostmessage", {
        name: "omnipostmessage",
        args: event.detail,
        callId: "omnipostmessage",
      });
    }

    /**
     * Making sure eventData is an Object literal.
     */
    const eventData = (() => {
      try {
        return JSON.parse(event.data);
      } catch (e) {
        return event.data;
      }
    })();

    /**
     * No eventData means just forward the postmessage to native.
     */
    if (!eventData) {
      return postMessageToNativeApp("postmessage", {
        name: "postmessage",
        args: event.detail,
        callId: "postmessage",
      });
    }

    /**
     * Request from native is to set a property on the root lwc.
     */
    if (eventData.type === "setprops") {
      return setProps(eventData.props);
    }

    /**
     * Request from native is to set a property on the target child elements of the lwc.
     */
    if (eventData.type === "setelementprops" && eventData.target) {
      return setTargetElementProps(eventData.target);
    }

    /**
     * Request from native which resolves the promise and returns 
     * the response from the native.
    */
    if (
      eventData.type === "callback" &&
      eventData.callId !== "omniscript"
    ) {
      const methodFn = callBacks.get(eventData.callId);
      if (methodFn) {
        methodFn(eventData.response);
      }
    }

    /**
     * Request from native to reload the app
     */
    if (eventData.type === "reload") {
      reloadLwc(eventData.props);
    }

    if (eventData.type === 'error') {
      const methodFn = callBacks.get(eventData.callId);
      methodFn(null, eventData.message);
    }
  });
})();