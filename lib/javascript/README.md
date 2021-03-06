# Salesforce integration helper class

Provides a bridge between your javascript app and salesforce.

## Installation

### Local file

```bash
# Assuming you have downloaded the sdk on your machine
yarn add local/path/OmniStudioMobileSDK-Hybrid/lib/javascript
```

## Initialization
```javascript
import { Salesforce } from "omni-studio-mobile-sdk-javascript";

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

### clearData()

Removes token and user data from the SalesForce class. Usually called before signing out the user.

```javascript
sf.clearData();
```

### lwcUri(props: LWCProps, vfpage?: string) => string

```typescript
type LWCProps = {
  componentName: string;
  vfns: string;
  methods?: string[];
  lwcAttrs?: Object;
  refs?: string[];
};
```

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
  iframe.contentWindow.postMessage(
    {
      callId: data.callId,
      type: "callback", // should be callback
      response: dataToReturn,
    },
    "*"
  );
};

window.addEventListener("message", handler);
```

#### Event Data

Event Data is from the vfpage's postMessage request.

| field  | type   | description                                                                           |
| ------ | ------ | ------------------------------------------------------------------------------------- |
| args   | any[]  | data arguments from the lwc function call                                             |
| id     | string | iframe id (from the options data set by the user)                                     |
| callId | string | automatically generated by the vfpage                                                 |
| type   | string | what type of request (loaded, fnCall, omniscriptEvent, omniPostMessage, mobileAction) |
| name   | string | name of the function or name of the omniscript event                                  |

### via CustomEvent and setprops

This will set props on the main lwc.

Client lwc code:

```javascript
import { LightningElement, api } from "lwc";

export default class myLwc extends LightningElement {
  @api greeter;

  handleClick() {
    const evt = new CustomEvent("mobileaction", {
      composed: true,
      bubbles: true,
    });

    this.dispatchEvent(evt);
  }
}
```

Client javascript code:

```javascript
const handler = (event) => {
  if (event.data.name === "mobileaction") {
    iframe.contentWindow.postMessage(
      {
        type: "setprops",
        props: {
          greeter: "Hello World!",
        },
      },
      "*"
    );
  }
};

window.addEventListener("message", handler);
```

Note:
**mobileaction** is a required event name if you want the visualforce page to recognize the event

### via CustomEvent and setelementprops for nested lwc.

Set props on nested child elements.

Client javascript code

```javascript
const handler = (event) => {
  if (event.data.name === "mobileaction") {
    iframe.contentWindow.postMessage(
      {
        type: "setelementprops",
        target: [
          {
            element: "c-inner-greeter c-super-inner-element", // separated by spaces
            props: {
              greeter: "The quick brown fox",
            },
          },
        ],
      },
      "*"
    );
  }
};

window.addEventListener("message", handler);
```

## Adding mobileMethods to child elements

If you want your nested elements have access to mobileMethods, just pass a **refs** (an array of element names) to the request.

```javascript
const lwcSource = sf.lwcUri({
  componentName: "testDoneEnglish",
  refs: [
    "c-inside-testdone c-super-inner-component",
    "c-other-child c-inside-other-child input",
  ],
});
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
