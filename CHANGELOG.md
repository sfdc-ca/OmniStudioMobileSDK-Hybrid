### 0.0.2 (October 21, 2020)

- Add vfpage code (typescript).
- Change vfpage from ~~JsSdkMobileLwcPreviewPage2~~ to `MobileSdkDev`.
- Change vfpage url params to use base64 encoding. From ~~?data={"lwc": "component"}~~ to `?data=eyJjb21wb25lbnQiOiJjQnV0dG9uIn0=`.
- Sample data for the vfpage data param before encoding to base64:

```json
 {
    "ns": "vlocity_ins",
    "vfns": "vlocity_ins",
    "component": "doSomethingButton",
    "props": {
      "layout": "lightning",
    },
    "refs": ["c-input"],
    "methods": ["getData"]
};
```

- `refs` is now `string[]` from ~~string[][]~~.
- Add new postmessage events to handle different types aside from `loaded` and `fnCall`.
- New postmessage events:

```
omniscriptEvent - omniscript custom events.
omniPostMessage - from omniscript messaging framework (postMessage)
mobileAction - Generic custom event.
```
