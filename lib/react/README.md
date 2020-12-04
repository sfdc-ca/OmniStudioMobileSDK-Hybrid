# OmniStudio Mobile SDK

## ReactNative SDK

### Installation

```bash
yarn add omni-studio-mobile-sdk-react
```

or

```bash
npm install omni-studio-mobile-sdk-react
```

#### Installing dependencies

To frontload the installation work, also install required depencencies:

```bash
yarn add omni-studio-mobile-sdk-javascript react-native-webview
```

or

```bash
npm install omni-studio-mobile-sdk-javascript react-native-webview
```

### Getting Started

Wrap the whole app in `SfProvider` . Usually in the entry file such as `index.js` or `App.js` . Then add your salesforce config on the `config` property.

```javascript
import React from 'react';
import { SfProvider } from 'omni-studio-mobile-sdk-react';

const config = {
  callbackUrl: 'APP_DEEPLINK_URL',
  clientId: 'YOUR_CLIENT)ID',
  authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
  apiVersion: 'v45.0',
  responseType: 'token',
};

const App = () => (
    <SfProvider config={config}>
      /** Your App Code */
    </SfProvider>
  );


export default App;
```

The `callbackUrl` is where the redirect url will be after a successful login.

### useSf hook

This hook returns the `Salesforce` instance from the `omni-studio-mobile-sdk-javascript` library.

```javascript
const { sf } = useSf();
```

#### Salesforce Api

This is the `sf` object returned by the `useSf` hook. More details on the javascript documentation here  [omni-studio-mobile-sdk-javascript](/lib/javascript)

### Components

SDK's react native components.

#### CardsOut

Renders a card component

Example:
```javascript
import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Dimensions} from 'react-native';

import {CardsOut} from 'omni-studio-mobile-sdk-react';

const CardsoutScreen = () => {
  const layout = 'campaign-detail';
  const layoutId = 'a1L6A000001a5ZiUAI';
  const ns = 'c';
  const params = {
    id: '7013u000000TrdBAAS',
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
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default CardsoutScreen;
```
##### Cardsout Props
|name|type|description|
|------|-------|------------|
|layout| String| layout name|
|layoutId| String | layout id |
|params | Object | Optional. card params |
|ns| String | Optional. namespace prefix to use |
|style | Object | Optional. React native stylesheet|

#### LoginButton
This component renders a `Pressable` component from react native which opens up a url that points to the `authUrl` from the startup `config`.

```javascript
import {View} from 'react-native';
import {LoginButton} from 'omni-studio-mobile-sdk-react';

const LoginScreen = () => (
  <View>
    <LoginButton>
      <Text>Salesforce Login</Text>
    </LoginButton>
  </View>
);
```
#### Lwc

Renders an LWC webview. Requires to have the mobile lwc sdk vfpage installed on your org and the mobile lwc sdk utility lwc class. ***More info soon.***

##### Loading the Lwc Component

###### Basic Lwc

```javascript
import {StyleSheet} from 'react-native';
import {Lwc} from 'omni-studio-mobile-sdk-react';

const MyLwc = () => {
  return (
    <Lwc 
      componentName="myLwcDemo"
      lwcAttrs={{
        greeter: 'Hello World'
      }}
      onLwcLoad={() => console.log('loaded')}
      style={styles.lwc}
    />
  );
};

const styles = StyleSheet.create({
  lwc: {
    height: 300,
  },
});

```

###### Lwc with Methods

```javascript
const MyLwc = () => {
  return (
    <Lwc 
      componentName="myLwcDemo"
      lwcAttrs={{
        greeter: 'Hello World'
      }}
      methods={{
        fetchData: async (id) => {
          const data = await getUserById(id);
          return data;
        }
      }}
    />
  );
};

```

The `methods` prop is an object that contains functions. Theses function names should be exactly the same with your LWC.

```javascript
// on your lwc file
import {LightningComponent, api} from 'lwc';

export class myLwcDemo extends LightningComponent {

  @api mobileMethods;

  async handleClick() {
    const data = await this.mobileMethods.fetchData('00ACF60HTA1');
    console.log({ data });
  }
}
```

##### Lwc Component Props

|name| type| description |
|-------|-------|---------|
|methods|Object| Optional. An object that contains functions that the lwc from the webview can call.
|componentName|String| Required. The lwc component name|
|lwcAttrs|Object| Optional. The Lwc props|
|refs| String[] | Optional. Element tag names that you want to have access to the mobile metgods to. Initially child elements doesn't have access to the mobileMethods, you need to explicitly attach the props `mobileMethods` to it.
|vfpage| String| Optional. If you wish to override the default vfpage.
|defaultNs| Boolean| Optional. If set to true, the lwc component will use the `c` prefix. (c-button). Defaults to false.
|vfns| String| Optional. If you wish to override the visual force namespace. (not the lwc namespace).
|frontdoor| Boolean| Optional. If set to true, will wrap te lwc component vfpage in a frontdoor request. Defaults to false.
|style|Object| Optional. React native stylesheet of the webview.|


##### Lwc Component Events

###### onMessage

Will trigger when the webview sends a post message event.

###### onMobileAction

Will trigger when the lwc from the webview emits a `mobileaction` custom event.

###### onOmniscriptApiResponse

Will trigger once the dataraptor response has been received by the lwc omniscript.

###### onOmniscriptCancel

Will trigger when the cancel button is clicked on the omniscript lwc.


###### onOmniscriptEvent

Will trigger on every omniscript custom event.

###### onOmniscriptMessage

Will trigger on every omniscript postmessage.

###### onLwcLoad

Will trigger once the lwc has successfully loaded.


##### Lwc Component Handlers

###### setElementProps: (element: string, props: Object) => void

Sets an element attribute. The target element must be a child of the lwc.

###### setProps: (props: Object) => void

Sets the attrbiute of the lwc.


###### sendError: (message: string, callId: string) => void

Will trigger an error to the lwc from the method call.

Component handler example:

```javascript
const el = useRef();

useEffect(() => {

  /**
   * c-inner-lwc greeter attribute value will
   * be set to "Hello".
   */
  el.current.setElementProps({
    element: 'c-inner-lwc',
    props: {
      greeter: 'Hello',
    },
  });

  /**
   * Lwc's userId attribute will be set to "001AOF900"
   */
  el.current.setProps({
    userId: '001AOF900'
  });

}, []);

return (
  <Lwc 
  ref={el}
  ...
  />
);

```

##### Triggering Error

```javascript
const el = useRef();

const methods = {
  fetchData: async ({callId}) => {
    try {
      const data = await getFromApi();
      setData(data);
    } catch(e) {
      /**
       * Will send a post message event with an
       * error type to the webview.
       */ 
      el.current.sendError(e.message, callId);
    }
  }
};

return (
  <Lwc ref={el} methods={methods} ... />
);
```

#### OmniOut

Renders an Omniout webview.

Example:

```javascript
import React from 'react';
import {SafeAreaView, ScrollView, StyleSheet, Dimensions} from 'react-native';

import {Omniout} from 'omni-studio-mobile-sdk-react';

const OmnioutScreen = () => {
  const omniScriptType = 'test';
  const subType = 'done';
  const language = 'english';

  const onMessage = (event) => {
    console.log('Omniout Event', event);
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
const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  webView: {
    width,
    height,
  },
});

export default OmnioutScreen;

```

#### Omniout Props
|name|type|description|
|----|----|-----------|
|omniScriptType| String| Type of omniscript|
|subType| string| Subtype of omniscript |
|language | string | Language of the omniscript |
| style | Object | Optional. React native stylesheet |
