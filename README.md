## Documentation

[React sdk](/lib/react/)

[Javascript sdk](/lib/javascript/)

# Lightning Web Component

## VlocityMobile

A higher-order function that extends the LightningElement or any other functions that also extends LightningElement. This function adds integration to native mobile sdk (IOS, Android, React Native, and Javascript SDK).


```javascript
import { LightningElement } from 'lwc';
import { VlocityMobile } from 'c/vlocityMobile';

export default class MyLwc extends VlocityMobile(LightningElement) {

}

```

**Cards**
```javascript
import { LightningElement } from 'lwc';
import {BaseLayout} from 'c/baseLayout';
import {VlocityMobile} from 'c/vlocityMobile';

export default class MyLwc extends VlocityMobile(BaseLayout(LightningElement)) {

}
```

**Omniscript**
```javascript
import { LightningElement } from 'lwc';
import { OmniscriptBaseMixin } from 'c/omniscriptBaseMixin';
import {VlocityMobile} from 'c/vlocityMobile';

export default class MyLwc extends VlocityMobile(OmniscriptBaseMixin(LightningElement)) {

}
```

### Using VlocityMobile api

#### mobileAction: (data: any) => void
Fires a *mobileaction* CustomEvent.

*mobileaction* Custom Event is a generic event that the visualforce page listens to that is passed as a postmessage to the native sdk.

```javascript
handleClick() {
  this.mobileAction({
    myData: 'Hello',
    foo: 'bar',
  });
}
```

The above code is the same as:
```javascript
handleClick() {
  this.dispatchEvent(new CustomEvent('mobileaction', {
    detail: {
      myData: 'Hello',
      foo: 'bar',
    },
    composed: true,
    bubbles: true
  }))
}
```

#### prefixed mobileMethods

mobileMethods will automatically be prefixed by **vlocMob**.

If you have a mobileMethod named *getContact*, calling the method would be *vlocMobGetContact*.

```javascript
async handleClick() {
  const data = await this.vlocMobGetContact();
  console.log(data);
}
```

The above code is the same as:
```javascript
async handleClick() {
  const data = await this.mobileMethods.getContact(); // this would still work.
  console.log(data);
}
```

#### handling connectedCallback

If you have a custom connectedCallback in your LWC, you should call the parent's connectedCallback.

```javascript
connectedCallback() {
  super.connectedCallback();

  // do something
}

```

##### Nested child integration to mobileMethods

1. If your LWC is not the root LWC or not the direct child of the root LWC (3rd level),

2. And, if you want it to have access to mobileMethods,


You can add the integration in your connectedCallback using initMobileMethods function.

```javascript

/*
* If your lwc is inside another lwc.
* example hierarchy
* c-root-lwc > c-inner-lwc > c-my-target-lwc
*/
connectedCallback() {
  super.connectedCallback();

  this.initMobileMethods(['c-inner-lwc c-my-target-lwc']);
}
```
