export type CreateLwcInput = {
  vfns: string;
  ns: string;
  component: string;
  props: any;
  methods: string[] | null | undefined;
  refs: string[] | null | undefined;
};

export type MobileMethod = {[K: string]: (...a: any) => Promise<any>};

export type RequestType =
  | 'loaded'
  | 'fnCall'
  | 'omniscriptEvent'
  | 'mobileAction'
  | 'omniPostMessage';

export type CallbackInput = [responseData: any, error: string | null];

export type CallbackMap = Map<string, (...props: CallbackInput) => void>;

export type PostMessageData = {
  data: any;
  type: RequestType;
  id: string;
};

export type LwcMobile = HTMLElement & {mobileMethods: MobileMethod | null};

export type SetChildrenOptions = {
  element: string;
  props: any;
};
