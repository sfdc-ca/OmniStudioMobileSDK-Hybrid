# Vlocity React Native Components

React native components on top of the vlocity javascript sdk.

## Installation

If you have downloaded the repository on your local machine.

```bash
yarn add file:../path/to/via_mobile_hybrid_sdk
```

If you have access to remote repository

```bash
yarn add ssh://git@bitbucket.org:vloc/via_mobile_hybrid_sdk.git
```

### Initialization

```typescript
SalesforceConfig {
  authUrl: string;
  clientId: string;
  callbackUrl: string;
  clientSecret: string;
  apiVersion: string;
  responseType: string;
}
```

```javascript
//App.js
import React from "react";

// Context provider
import { SfProvider } from "mobile-hybrid-sdk/react";

import Routes from "./Routes";

/**
 * Salesforce org config - clientId, callbackUrl, etc. which
 * required by the vloc-js-sdk to instantiate the class.
 */
import config from "./config";

const App = () => {
  /**
   * Wrap your app inside the context.
   */
  return (
    <SfProvider config={config}>
      <Routes />
    </SfProvider>
  );
};

export default App;
```

SfProvider is a global state context that provides an instance of the useSf hook.

## Api

### useSf():\{sf}

Returns the Salesforce instance.

```javascript
import { useSf } from "mobile-hybrid-sdk/react";

const { sf } = useSf();
```

sf is the Salesforce instance which has the following api:

- setNsPrefix
- setConfig
- setTokenData
- authUrl
- tokenFromUrl
- toQueryUrl
- profileQuery
- idFromUrl
- fetch
- getProfile
- clearData
- nsPrefixQuery
- lwcUri
- omniOutUri
- cardsOutUri
- frontDoor
- cookieUrls
- refreshTokenData
- requestRefreshToken
- lwcIframe
- init

## Components

### LoginButton

```jsx
import { Text } from "react-native";
import { LoginButton } from "mobile-hybrid-sdk/react";

...

<LoginButton style={{ backgroundColor: "red" }}>
  <Text>Salesforce Login</Text>
</LoginButton>

...
```

### Lwc

```javascript
import { Lwc } from "mobile-hybrid-sdk/react";

<Lwc componentName="myLwc" />;
```

#### Lwc Props

##### componentName

`String`

The LWC name. `doSomethingButton`, `mobileDemoCards`.

##### methods

`Object`

An object on which keys that the lwc component can refer to, to be able to call the value(function).

##### defaultNs

`Boolean`

If set to `true`, will use `c` as the namespace prefix.

##### vfPage

`String`

Will override the default vfpage used by the sdk.

##### lwcAttrs

`Object`

Props that the LWC will use. It can be an html element attribute or an lwc @api props.

##### style

`Object`

React native style.

#### fronDoor

`Boolean`

Will wrap the component in the frontdoor url.

#### webViewProps

`Object`

_WebView_ component props.

#### headers

`Object`

http headers you want to pass on the webview.

#### refs

`String[]`

Html element tag names that will attache the mobileMethods into.

```javascript
refs={[
  'direct-child-of-lwc c-button'
]}
```

### LWC handlers

#### onMessage

Handles all postmessage fired by the webview.

#### onMobileAction

Handles `mobileAction` event.

#### onOmniscriptApiResponse

Handles omniscript dataraptor post message.

#### onOmniscriptCancel

Handles omniscript cancel postmessage event.

#### onOmniscriptEvent

Handles custom omniscript events.

#### onOmniscriptMessage

Handlers omniscript post message events from their messaging framework.

#### onLwcLoad

Fires on successful loading of the lwc.

##### Lwc example with method handlers

```javascript
import React, { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Dimensions } from "react-native";

import { Lwc } from "mobile-hybrid-sdk/react";

const LwcScreen = ({ navigation }) => {
  const [lwcAttrs, setLwcAttrs] = useState({
    greeter: "Hello World!!!!",
  });
  const componentName = "nxgPropsDemo"; // Demo
  const defaultNs = false;

  /**
   * Functions that are exposed to the LWC.
   * These functions are called
   * from the LWC.
   */
  const methods = {
    returnValue: () => 3,
    asyncDemo: async () => "ASYNC RETURN",
    mockApi: (params) => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const mockApiData = { data: { items: [{ name: params }] } };
          resolve(mockApiData);
        }, 3000);
      });
    },
    fromParams: (a, b) => `(${a}) AND (${b})`,
    goto: (url = "/") => {
      navigation.navigate("Omniout");
    },
    showAlert: (message) => {
      alert(message);
    },
    changeGreeter: () => {
      setLwcAttrs({
        greeter: "Greeter Changed!",
      });
    },
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Lwc
          componentName={componentName}
          lwcAttrs={lwcAttrs}
          methods={methods}
          style={styles.webView}
          defaultNs
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles related block
const { width, height } = Dimensions.get("window");
const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default LwcScreen;
```

### CardsOut

```javascript
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Dimensions } from "react-native";

import { CardsOut } from "mobile-hybrid-sdk/react";

const CardsoutScreen = () => {
  const layout = "campaign-detail";
  const layoutId = "a1L6A000001a5ZiUAI";
  const ns = "c";
  const params = {
    id: "7013u000000TrdBAAS",
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <CardsOut
          layout={layout}
          layoutId={layoutId}
          ns={ns}
          style={styles.webView}
          params={params}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles related block
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default CardsoutScreen;
```

### Omniout

```javascript
import React from "react";
import { SafeAreaView, ScrollView, StyleSheet, Dimensions } from "react-native";

import { Omniout } from "mobile-hybrid-sdk/react";

const OmnioutScreen = () => {
  const omniScriptType = "test";
  const subType = "done";
  const language = "english";

  const onMessage = (event) => {
    console.log("Omniout Event", event);
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Omniout
          omniScriptType={omniScriptType}
          subType={subType}
          language={language}
          style={styles.webView}
          onMessage={onMessage}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles related block
const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default OmnioutScreen;
```
