# Salesforce integration helper class

Provides a bridge between your javascript app and salesforce.

## Installation

### Local file

```bash
# Assuming you have downloaded the sdk on your machine
npm install file:../mobile-hybrid-sdk
```

### From a repository where you have access

```bash
# For example, using my bitbucket repo
npm install ssh://git@bitbucket.org:marc_vlocity/mobile-hybrid-sdk.git
```

## Initialization

```javascript
import { Salesforce } from "mobile-hybrid-sdk/lib/javascript/dist/main";

const config = {
  callbackUrl: "[CALLBACK_URL]",
  clientId: "[CLIENT_ID]",
  authUrl: "https://login.salesforce.com/services/oauth2/authorize",
  apiVersion: "v45.0",
  responseType: "token",
};

const sf = new Salesforce(config);
```

After initializing the class, you now have access to the SDK's api. Below are the api's public methods you can use.

## Api

The api is designed in a simplistic manner, mostly just to provide the URL that you need.

### authUrl(): string

Returns the login url based on the config that can be used to open up a page to authenticate.

```javascript
const authUrl = sf.authUrl();

window.open(authUrl);
```

### tokenFromUrl(redirectUrl: string): TokenData

After a successful login, you will be redirected to your callback url(based on your config). Use that url to get the access token and other token data. This method returns the token data from the redirect/callback url

```javascript
const url = "the-callback-or-redirect-url-from-a-successful-login";
const token = sf.tokenFromUrl(url);

// token data includes these four values
const { access_token, instance_url, id, refresh_token } = token;
```

### getProfile(token?: string): Promise<UserData>

Note: you can pass an access token if you know that it is not available inside the SalesForce class. Use case when fetching user profile to check if the access token is valid.

```javascript
const user = await sf.getProfile();

const { Id, Email, Username, FirstName, LastName, Name, SmallPhotoUrl } = user;
```

### cookieUrls(): string[]

Returns a set of domains to set the cookie on. Set the name of the cookie as "sid".

```javascript
//using js-cookie library to easily add cookies. But you can use any cookie library you want.
import Cookies from "js-cookie";

const cookieDomains = sf.cookieUrls();
cookieDomains.forEach((item) => {
  Cookie.set("sid", item);
});
```

### setTokenData(token: TokenData): TokenData

If you want to explicitly set the token data into the class. Use case: set the token, from local storage or from other source, into the class

```javascript
const token = {...};
sf.setTokenData(token);
```

### setConfig(config: Config)

Sets the config data into the class.

```javascript
  const newConfig = {...};
  sf.setConfig(newConfig);
```

### setUser(user: User)

Sets the user data into the class.

```javascript
  const user = {...};
  sf.setUser(user);
```

### fetchNsPrefix(): Promise<ApexRecordResult>

Fetch the namespace prefix of your org.

```javascript
const resppnse = await sf.fetchNsPrefix();
const nsPrefix = response.records[0].NamespacePrefix;
```

### requestRefreshToken(): Promise<TokenData>

Request for a new token data using the refresh token

```javascript
const tokenData = await sf.requestRefreshToken();

// next step
// set cookies for new token data (access_token)
```

### clearData()

Removes token and user data from the SalesForce class. Usually called before signing out the user.

```javascript
sf.clearData();
```

### lwcUri({componentName: string, lwcAttrs?: Object, defaultNs?: boolean, refs: string[], methods: string[], iframeId: string}, vfpage?: string): string

Returns the vfpage url for the lwc. Optional vfpage url to override.

```javascript
const lwcButtonUrl = sf.lwcUri({
  componentName: "button",
  lwcAttrs: {
    title: "Hello World!",
  },
});

// apply the lwc url to the iframe
const myIframe = document.querySelector("#lwc");
myIframe.src = lwcButtonUrl;
```

```html
<iframe id="lwc" />
```

### cardsOutUri(CardsOutParams: Object, vfpage?: string): string

Returns the vfpage url for the cardsout. Optional vfpage url to override.

```javascript
const params = {
  layout: "campaign-detail",
  layoutId: "a1L6A000001a5ZiUAI",
  ns: "c",
  params: {
    id: "7013u000000TrdBAAS",
  },
};
const campaignDetailUrl = sf.cardsOutUri(params);

// apply the cardsout url to the iframe
const myIframe = document.querySelector("#lwc");
myIframe.src = campaignDetailUrl;
```

```html
<iframe id="lwc" />
```

### omniOutUri(OmniOutParams: Object, vfpage?: string): string

Returns the vfpage url for the omniout. Optional vfpage url to override.

```javascript
const params = {
  omniScriptType: "test",
  subType: "done",
  language: "english",
};
const testDoneEnglishUrl = sf.omniOutUri(params);

// apply the omniout url to the iframe
const myIframe = document.querySelector("#lwc");
myIframe.src = testDoneEnglishUrl;
```

```html
<iframe id="lwc" />
```

### frontDoor(url: string): string

Returns a frontdoor page that will redirect to the requested url.

```javascript
const url = "https://my-org.salesforce.com/apex/MyPage";
const withFrontDoorUrl = sf.frontDoor(url);
```

### fetch(url: string): Promise<any>

Enhanced fetch with access token applied on the authorization bearer. Url should be an absolute url.

```javascript
const response = await fetch("https://some/endpoint");
```

### init(callbackUrl: string): \{nsPrefix, tokenData, user}

Initializes the essential org data, usually called first when the callback url loads.

```javascript
const res = await sf.init(window.location.href);

const { nsPrefix, tokenData, user } = res;
```

## Two way communication

### via mobileMethods

Client lwc code:

```javascript
// lwc
import { LightningElement, api } from "lwc";

export default class MyButton extends LightningElement {
  @api mobileMethods;

  async handleClick() {
    const data = await this.mobileMethods.getData(1, "foo");
    console.log(data); // logs "data for 1 with type foo"
  }
}
```

Client javascript code:

```javascript
// client javascript
const iframe = document.querySelector("iframe");

const methods = {
  getData: (id, type) => `data for ${id} with type ${type}`,
};

const lwcSource = sf.lwcUri({
  componentName: "myButton",
  methods: Object.keys(methods),
});

/**
 * lwcSource, what it looks like:
 * https:..../apex/JsSdkMobileLwcPreviewPage2?data={lwc: 'myButton',methods: ['getData']}
 */

iframe.src = lwcSource;

const handler = (event) => {
  const { data } = event; // Event Data, please see reference below.
  if (!methods[data.name]) {
    throw new Error("Method not found");
  }

  const dataToReturn = methods[data.name].apply(null, data.args);
  /**
   * Before the postMessage below, you can do anything like:
   * const responseData = await fetchData();
  */
  
  /*
  * This postmessage will execute the resolver function on the vfpage.
  */
  iframe.contentWindow.postMessage({
    callId: data.callId,
    type: 'callback', // should be callback
    response: dataToReturn,
  }, '*');
};

window.addEventListener("message", handler);
```

#### Event Data
Event Data is from the vfpage's postMessage request.



| field  | type           | description                                          |
| ------ | -------------- | ---------------------------------------------------- |
| args   | any[]          | data arguments from the lwc function call            |
| id     | string         | iframe id (from the options data set by the user)    |
| callId | int            | automatically generated by the vfpage                |
| type   | fnCall, loaded | what type of request                                 |
| name   | string         | name of the function or name of the omniscript event |


### via CustomEvent and setprops 

This will set props on the main lwc.

Client lwc code:
```javascript
import {LightningElement, api} from 'lwc';

export default class myLwc extends LightningElement {
  @api greeter;

  handleClick() {
    const evt = new CustomEvent('mobileaction', {
      composed: true,
      bubbles: true
    });

    this.dispatchEvent(evt);
  }
}
```

Client javascript code:
```javascript

const handler = (event) => {
  
  if (event.data.name === 'mobileaction') {
    iframe.contentWindow.postMessage({
      type: 'setprops',
      props: {
        greeter: 'Hello World!'
      },
    }, '*');
  }
};

window.addEventListener("message", handler);

```

Note: 
**mobileaction** is a required event name if you want the native side to recognize the event

### via CustomEvent and setelementprops for nested lwc.

Set props on nested child elements.

Client javascript code
```javascript
const handler = (event) => {
  
  if (event.data.name === 'mobileaction') {
    iframe.contentWindow.postMessage({
      type: 'setelementprops',
      target: [
        {
          element: "c-inner-greeter c-super-inner-element", // separated by spaces
          props: {
            greeter: "The quick brown fox",
          },
        },
      ],
    }, '*');
  }
};

window.addEventListener("message", handler);
```

## Adding mobileMethods to child elements

If you want your nested elements have access to mobileMethods, just pass a **refs** (an array of element names) to the request.

```javascript
const lwcSource = sf.lwcUri({
  componentName: 'myInnerComponent',
  refs: [
    'c-inner-component c-super-inner-component',
    'c-other-child c-inside-other-child'
  ]
});

/**
 * this will look something like this:
 * https://.../apex/JsSdkMobileLwcPreviewPage2?data={lwc: 'myInnerComponent',refs:['c-inner-component c-super-inner-component']
 */
```

## Re-initialize or add mobile methods to nested child elements

Client LWC

Sometimes the children of the root lwc will re-render causing the loss of connection to mobileMethods

Firing the **initmobilemethods** will re-instate the mobileMethods to the default refs and also the user can add additional refs by passing an array of string to detail field.

```javascript
  // lwc code

  connectedCallback() {
    const evt = new CustomEvent('initmobilemethods', {
        bubbles: true,
        composed: true,
        detail: ['c-omni-button input'] // optional additional refs to add the mobile methods into.
    });
    this.dispatchEvent(evt);
  }
```

If you want to automatically re-initialize the mobile methods in your omniscript lwc, you should enable window post message then add a key value pair of -> refs: ["c-inner-element"] or an empty array -> refs: []

Note: refs is optional if your omniscript lwc is an Omniscript Step.

LWC lifecycle https://lwc.dev/guide/lifecycle

## Using Mobile sdk in your LWC

```javascript
import { LightningElement } from 'lwc';
import { Mobile } from 'c/mobile';

export class MyLwc extends Mobile(LightningElement) {

}
```

**@api mobileMethods** is already available, no need to add.

### Methods using Mobile sdk

#### mobileAction
Shortcut method to dispatch a mobileaction custom event
```javascript
handleClick() {
  this.mobileAction({
    id: this.id
  });
}
```

#### mobileMethods
mobileMethods can be called directly using the prefixed method name

```javascript
// client code

const methods = {
  getData: () => ({ data: 1 }),
};
```

```javascript
// lwc method

handleClick() {
  const {data} = this.vlocMobGetData();

  console.log(data);
}
```
You can still use *this.mobileMethods.getData()*
#### initMobileMethods

```javascript
connectedCallback() {
  this.initMobileMethods();
}

// with parameters
connectedCallback() {
  this.initMobileMethods(['c-my-lwc c-inner-element']);
}
```
