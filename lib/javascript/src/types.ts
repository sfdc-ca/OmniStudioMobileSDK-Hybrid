export interface UrlData {
  instance_url: string;
  access_token: string;
  id: string;
  refresh_token: string;
}

export interface SalesforceConfig {
  authUrl: string;
  clientId: string;
  callbackUrl: string;
  clientSecret: string;
  apiVersion: string;
  responseType: string;
}

export interface LwcConfig {
  componentName: string;
  defaultNs: boolean;
  lwcAttrs: any;
  methods: string[];
  iframeId: string;
  vfns: string;
  refs: string;
}

export interface CardConfig {
  layout: string;
  layoutId: string;
  ns: string;
  params: any;
}

export interface OmniConfig {
  omniScriptType: string;
  subType: string;
  language: string;
}

export interface CurrentConfig {
  nsPrefix: string;
  tokenData: UrlData;
  user: any;
}

export interface User {
  Id: string;
  Email: string;
  Username: string;
  FirstName: string;
  LastName: string;
  Name: string;
  SmallPhotoUrl: string;
}
