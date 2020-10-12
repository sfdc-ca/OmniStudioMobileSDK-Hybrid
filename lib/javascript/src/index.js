/**
 * Salesforce integration helper class
 */
export class Salesforce {
  /**
   * Initialization config
   * @typedef {Object} Config
   * @property {string} authUrl
   * @property {string} clientId
   * @property {string} callbackUrl
   * @property {string} clientSecret
   * @property {string} apiVersion
   * @property {string} responseType
   */

  /**
   * @param {Config} config Required configuration upon initialization of the class
   */
  constructor(config) {
    this.user = null;
    this.tokenData = null;
    this.nsPrefix = "";

    this.setConfig(config);
  }

  /**
   * Set namespace prefix into the class.
   * @param {string} nsPrefix Namespace prefix of the org
   */
  setNsPrefix(nsPrefix) {
    this.nsPrefix = nsPrefix;
    return nsPrefix;
  }

  /**
   * Set user data into the class.
   * @param {Object} user
   */
  setUser(user) {
    this.user = user;
  }

  /**
   * Set configuration data into the class.
   * @param {Config} config
   */
  setConfig(config) {
    this.config = config;

    return config;
  }

  /**
   * Set token data into the class.
   * @param {string} tokenData Salesforce org access token
   */
  setTokenData(tokenData) {
    this.tokenData = tokenData;
    return tokenData;
  }

  /**
   * @return {string} Full login url for authentication
   */
  authUrl() {
    const { authUrl, clientId, callbackUrl } = this.config;

    const url = `${authUrl}?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      callbackUrl
    )}`;

    return url;
  }

  /**
   * @typedef {Object} TokenData
   * @property {string} instance_url
   * @property {string} access_token
   * @property {string} id
   * @property {string} refresh_token
   *
   * @param {string} url Login redirect url with query parameters from salesforce
   * @return {TokenData}
   */
  tokenFromUrl(url) {
    const dataUrl = url.split("#")[1];
    const dataArray = decodeURIComponent(dataUrl).split("&");
    const data = dataArray.reduce((c, n) => {
      const [key, value] = n.split("=");

      return {
        ...c,
        [key]: value,
      };
    }, {});

    this.setTokenData(data);

    return data;
  }

  /**
   * @param {string} q soql query
   * @return {string} Full url including instance url with query endpoint and query string
   */
  toQueryUrl(q) {
    const { apiVersion: v } = this.config;
    const queryString = encodeURI(q).replace(/%20/g, "+");
    const url = `services/data/${v}/query?q=${queryString}`;

    const endpoint = `${this.tokenData.instance_url}/${url}`;

    return endpoint;
  }

  /**
   * Url endpoint to query user profile
   * @param {string} id user id
   * @return {string} Full url query endpoint for fetching user profile by id
   */
  profileQuery(id) {
    const q = `SELECT Id, Email, Username, FirstName, LastName, Name, SmallPhotoUrl  FROM User WHERE Id = '${id}'`;

    return this.toQueryUrl(q);
  }

  /**
   *
   * @param {string} idUrl Identity url
   * @return {string} User id
   */
  idFromUrl(idUrl) {
    return idUrl.split("/").pop();
  }

  /**
   * Enhanced fetch, applies access token to authorization bearer
   * @param {string} endpoint
   * @return {Promise}
   */
  fetch(endpoint) {
    const headers = { Authorization: `Bearer ${this.tokenData.access_token}` };
    const options = { headers };

    return fetch(endpoint, options).then((res) => res.json());
  }

  /**
   * Fetch the user profile
   * @param {string} token access token
   * @return {Promise} user data
   */
  async getProfile(token = null) {
    const tokenData = token || this.tokenData;

    // access token is required to be able to fetch the profile
    if (!tokenData) {
      throw new Error("Please set a tokenData");
    }

    const userId = this.idFromUrl(tokenData.id);

    try {
      const endpoint = this.profileQuery(userId);
      const userProfile = await this.fetch(endpoint);
      const user = userProfile.records[0];

      this.user = user;
      return user;
    } catch (e) {
      throw new Error(e);
    }
  }

  /**
   * Remove saved local user credentials and token data
   */
  clearData() {
    this.tokenData = null;
    this.user = null;
  }

  /**
   * @return {string} soql query to select namespace prefix
   */
  nsPrefixQuery() {
    return `SELECT NamespacePrefix FROM ApexClass WHERE Name='VlocityOrganization'`;
  }

  /**
   * Generates the lwc vfpage url based on the passed configuration
   *
   * @typedef {Object} LWC
   * @property {string} componentName lwc name
   * @property {boolean} defaultNs If true, will set 'c' as the nsprefix. default is false
   * @property {Object} lwcAttrs Attribute to pass to the lwc
   * @property {string[]} methods
   * @property {iframeId} string Unique identifier of the iframe
   * @property {string} vfns
   * @property {string[]} refs reference to target element names that the vfpage will add the mobileMethods to
   *
   * @param {LWC} lwcProps lwc configuration props
   * @param {string} vfPage optional vfpage to render
   *
   * @return {string} Absolute url of the lwc vfpage with lwc configuration
   */
  lwcUri(lwcProps, vfPage) {
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
    const vf = vfPage || "JsSdkMobileLwcPreviewPage2";

    // Manually replace selected special characters with url encoding, to be handled by the js sdk vfpage.
    const dataUrl = JSON.stringify({
      lwc: componentName,
      ns: defaultNs ? "c" : this.nsPrefix,
      vfns: vfns || this.nsPrefix,
      methods,
      iframeId,
      refs,
      ...lwcAttrs,
    })
      .replace(/'/g, "%22")
      .replace(/#/g, "%23")
      .replace(/ /g, "%2B");

    const targetUrl = `${this.tokenData.instance_url}/apex/${vf}?data=${dataUrl}`;

    return targetUrl;
  }

  /**
   * @typedef {Object} OmniOut
   * @property {string} omniScriptType
   * @property {string} subType
   * @property {string} language
   *
   * @param {OmniOut} omniProps omniscript configuration props.
   * @param {string} vfPage optional vfpage to render.
   *
   * @return {string} absolute url of the vfpage to render the omniscript
   */
  omniOutUri(omniProps, vfPage = null) {
    const { omniScriptType, subType, language } = omniProps;
    const vf = vfPage || "OmniScriptUniversalPage";
    const baseUrl = `${this.tokenData.instance_url}/apex/${vf}`;
    const url = `${baseUrl}?OmniScriptType=${omniScriptType}&OmniScriptSubType=${subType}&OmniScriptLang=${language}`;

    return url;
  }

  /**
   * @typedef {Object} Cards
   * @property {string} layout
   * @property {string} layoutId
   * @property {string} ns namespace prefix
   * @property {Object} params card props
   *
   * @param {Cards} cardsProps
   */
  cardsOutUri(cardsProps) {
    const { layout, layoutId, ns, params } = cardsProps;
    const queryParams = (() => {
      if (params) {
        const q = Object.entries(params).reduce((c, n) => {
          const v = `${n[0]}=${n[1]}`;
          if (c) {
            return `&${v}`;
          }
          return v;
        }, "");
        return `&${q}`;
      }
      return false;
    })();
    const nsPrefix = ns || this.nsPrefix;
    const vf = "ConsoleCards";
    const baseUrl = `${this.tokenData.instance_url}/apex/${vf}`;
    const url = `${baseUrl}?layout=${layout}&layoutId=${layoutId}&previewMode=Universal&ns=${nsPrefix}${queryParams}`;

    return url;
  }

  /**
   * Frontdoor url
   * @param {string} retURL the requested url
   * @return {string} frontdoor url with the requested url
   */
  frontDoor(retURL) {
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
    const instance = this.tokenData.instance_url.split(".")[0];
    const urls = [
      `${instance}.content.force.com`,
      `${instance}.force.com`,
      `${instance}.salesforce.com`,
      `${instance}.my.salesforce.com`,
      `${instance}.lightning.force.com`,
      `${instance}--c.documentforce.com`,
      "https://*.salesforce.com",
      "https://*.force.com",
      "https://*.documentforce.com",
      "https://*.visualforce.com",
      "https://*.visual.force.com",
    ];
    return urls;
  }

  /**
   * @return {string} query parameter for requesting a token from a refresh token
   */
  refreshTokenData() {
    const { clientId, clientSecret } = this.config;

    return `grant_type=refresh_token&client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${this.tokenData.refresh_token}&format=json`;
  }

  /**
   * @return {Promise} token data from a refresh token request
   */
  async requestRefreshToken() {
    const refreshTokenUrl =
      "https://login.salesforce.com/services/oauth2/token?grant_type=refresh_token";
    const refreshTokenData = this.refreshTokenData();
    const res = await fetch(refreshTokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: refreshTokenData,
    });
    const data = await res.json();

    this.tokenData.access_token = data.access_token;
    return this.tokenData;
  }

  /**
   *
   * @param {string} iframeId
   * @param {Object} lwcProps
   * @param {string} vfpage
   *
   * @return {any} iframe element
   */
  lwcIframe(iframeId, lwcProps, vfpage) {
    if (!iframeId) {
      return false;
    }
    const props = (() => {
      if (!lwcProps) {
        return { componentName: iframeId };
      }
      if (typeof lwcProps === "string") {
        return { componentName: lwcProps };
      }
      return lwcProps;
    })();
    if (!props.componentName) {
      props.componentName = iframeId;
    }
    const iframeEl = document.getElementById(iframeId);
    iframeEl.src = this.lwcUri(
      {
        ...props,
        iframeId,
      },
      vfpage
    );

    return iframeEl;
  }

  /**
   * @typedef {Object} SfData
   * @property {string} nsPrefix
   * @property {Object} tokenData
   * @property {Object} user
   *
   * @param {string} callbackUrl
   *
   * @return {SfData}
   */
  async init(callbackUrl) {
    const tokenData = this.tokenFromUrl(callbackUrl);
    this.setTokenData(tokenData);

    const user = await this.getProfile();
    await this.fetchNsPrefix();
    this.user = user;

    return {
      nsPrefix: this.nsPrefix,
      tokenData,
      user,
    };
  }
}
