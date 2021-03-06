import {
  SalesforceConfig,
  User,
  UrlData,
  LwcConfig,
  OmniConfig,
  CardConfig,
} from './types';

const btoa = require('btoa');

/**
 * Salesforce integration helper class
 */
export class Salesforce {
  private user: User | null;
  private tokenData: UrlData | null;
  private nsPrefix: string;

  constructor(private config: SalesforceConfig) {
    this.user = null;
    this.tokenData = null;
    this.nsPrefix = '';

    this.setConfig(config);
  }

  setNsPrefix(nsPrefix: string) {
    this.nsPrefix = nsPrefix;
    return nsPrefix;
  }

  getUser() {
    return this.user;
  }

  setUser(user: User) {
    this.user = user;
  }

  setConfig(config: SalesforceConfig) {
    this.config = config;

    return config;
  }

  setTokenData(tokenData: UrlData) {
    this.tokenData = tokenData;
    return tokenData;
  }

  authUrl(): string {
    const {authUrl, clientId, callbackUrl} = this.config;

    const url = `${authUrl}?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl,
    )}`;

    return url;
  }

  tokenFromUrl(url: string): UrlData {
    const dataUrl = url.split('#')[1];
    const dataArray = decodeURIComponent(dataUrl).split('&');
    const data = dataArray.reduce((c, n) => {
      const [key, value] = n.split('=');

      return {
        ...c,
        [key]: value,
      };
    }, {} as UrlData);

    this.setTokenData(data);

    return data;
  }

  idFromUrl(idUrl: string): string {
    return idUrl.split('/').pop() || '';
  }

  fetch(endpoint: string) {
    const headers = {Authorization: `Bearer ${this.tokenData?.access_token}`};
    const options = {headers};

    return fetch(endpoint, options).then((res) => res.json());
  }

  /**
   * Remove saved local user credentials and token data
   */
  clearData() {
    this.tokenData = null;
    this.user = null;
  }

  nsPrefixQuery() {
    return `SELECT NamespacePrefix FROM ApexClass WHERE Name='VlocityOrganization'`;
  }

  toQueryUrl(q: string): string {
    const {apiVersion: v} = this.config;
    const queryString = encodeURI(q).replace(/%20/g, '+');
    const url = `services/data/${v}/query?q=${queryString}`;

    const endpoint = `${this.tokenData?.instance_url}/${url}`;

    return endpoint;
  }

  lwcUri(lwcProps: LwcConfig, vfPage?: string) {
    const {
      componentName,
      defaultNs = false,
      lwcAttrs = {},
      methods = [],
      iframeId = null,
      vfns = null,
      refs = null,
    } = lwcProps;
    if (!this.tokenData) {
      return null;
    }
    const vf = vfPage || 'MobileLwcSdk';

    // Manually replace selected special characters with url encoding, to be handled by the js sdk vfpage.
    const dataUrl = JSON.stringify({
      component: componentName,
      ns: defaultNs ? 'c' : this.nsPrefix,
      vfns: vfns || this.nsPrefix,
      methods,
      iframeId,
      refs,
      props: lwcAttrs,
    });

    const targetUrl = `${this.tokenData.instance_url}/apex/${vf}?data=${btoa(
      dataUrl,
    )}`;

    return targetUrl;
  }

  omniOutUri(omniProps: OmniConfig, vfPage = null) {
    const {omniScriptType, subType, language} = omniProps;
    const vf = vfPage || 'OmniScriptUniversalPage';
    const baseUrl = `${this.tokenData?.instance_url}/apex/${vf}`;
    const url = `${baseUrl}?OmniScriptType=${omniScriptType}&OmniScriptSubType=${subType}&OmniScriptLang=${language}`;

    return url;
  }

  cardsOutUri(cardsProps: CardConfig) {
    const {layout, layoutId, ns, params} = cardsProps;
    const queryParams = (() => {
      if (params) {
        const q = Object.entries(params).reduce((c, n) => {
          const v = `${n[0]}=${n[1]}`;
          if (c) {
            return `&${v}`;
          }
          return v;
        }, '');
        return `&${q}`;
      }
      return false;
    })();
    const nsPrefix = ns || this.nsPrefix;
    const vf = 'ConsoleCards';
    const baseUrl = `${this.tokenData?.instance_url}/apex/${vf}`;
    const url = `${baseUrl}?layout=${layout}&layoutId=${layoutId}&previewMode=Universal&ns=${nsPrefix}${queryParams}`;

    return url;
  }

  frontDoor(retURL: string) {
    if (!this.tokenData) {
      return null;
    }
    const frontDoor = `${this.tokenData.instance_url}/secur/frontdoor.jsp?sid=${this.tokenData.access_token}&retURL=${retURL}`;
    return frontDoor;
  }

  /**
   * @return {Promise} namespace prefix api data
   */
  async fetchNsPrefix() {
    try {
      const res = await this.fetch(this.toQueryUrl(this.nsPrefixQuery()));
      this.setNsPrefix(res.records[0].NamespacePrefix);
      return res;
    } catch (e) {
      return null;
    }
  }

  /**
   * Generates an array of cookie url
   * @return {string[]} cookie urls
   */
  cookieUrls() {
    const instance = this.tokenData?.instance_url.split('.')[0];
    const urls = [
      `${instance}.content.force.com`,
      `${instance}.force.com`,
      `${instance}.salesforce.com`,
      `${instance}.my.salesforce.com`,
      `${instance}.lightning.force.com`,
      `${instance}--c.documentforce.com`,
      'https://*.salesforce.com',
      'https://*.force.com',
      'https://*.documentforce.com',
      'https://*.visualforce.com',
      'https://*.visual.force.com',
    ];
    return urls;
  }

  lwcIframe(iframeId: string, lwcProps: LwcConfig, vfpage?: string) {
    if (!iframeId) {
      return false;
    }
    const props: any = (() => {
      if (!lwcProps) {
        return {componentName: iframeId};
      }
      if (typeof lwcProps === 'string') {
        return {componentName: lwcProps};
      }
      return lwcProps;
    })();
    if (!props.componentName) {
      props.componentName = iframeId;
    }
    const iframeEl = document.getElementById(iframeId) as HTMLIFrameElement;
    if (iframeEl) {
      iframeEl.src =
        this.lwcUri(
          {
            ...props,
            iframeId,
          },
          vfpage,
        ) || '';

      return iframeEl;
    }
    return false;
  }

  async init(callbackUrl: string) {
    const tokenData = this.tokenFromUrl(callbackUrl);
    this.setTokenData(tokenData);

    // const user = await this.getProfile();
    // this.user = user;
    await this.fetchNsPrefix();

    return {
      nsPrefix: this.nsPrefix,
      tokenData,
      // user,
    };
  }
}
