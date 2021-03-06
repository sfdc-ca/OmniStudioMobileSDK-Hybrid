import {Salesforce} from '../src';

global.fetch = jest.fn().mockResolvedValue({
  json: jest.fn().mockResolvedValue({}),
});

let sf: any = null;

const sampleConfig = {
  callbackUrl: '[CALLBACK_URL]',
  clientId: '[CLIENT_ID]',
  clientSecret: '[CLIENT_SECRET]',
  authUrl: 'https://login.salesforce.com/services/oauth2/authorize',
  apiVersion: 'v45.0',
  responseType: 'token',
};
const tokenDataObj = {
  access_token: 'foo',
  instance_url: 'https://sf.com',
  id: 'https://my/id/1',
  refresh_token: 'bar',
};

beforeEach(() => {
  (fetch as any).mockClear();
  sf = new Salesforce(sampleConfig);
  sf.setTokenData(tokenDataObj);
});

test('initializes the class', () => {
  expect(sf.config).toEqual(sampleConfig);
});

test('returns authurl', () => {
  const authUrl = sf.authUrl();
  expect(authUrl).toBe(
    `${sampleConfig.authUrl}?response_type=token&client_id=${
      sampleConfig.clientId
    }&redirect_uri=${encodeURIComponent(sampleConfig.callbackUrl)}`,
  );
});

test('returns token data from callback url', () => {
  const callbackUrl = `https://vlocity/success#access_token=foo&instance_url=${encodeURIComponent(
    'https://sf.com',
  )}&id=${encodeURIComponent('https://my/id/1')}&refresh_token=bar`;
  const tokenData = sf.tokenFromUrl(callbackUrl);
  expect(tokenData).toEqual(tokenDataObj);
});

test('cookie urls', () => {
  const cookieUrls = sf.cookieUrls();
  expect(cookieUrls.length).toBe(11);
  expect(cookieUrls[0]).toBe('https://sf.content.force.com');
});

test('set token data', () => {
  sf.setTokenData({foo: 'bar'});
  expect(sf.tokenData).toEqual({foo: 'bar'});
});

test('fetch namespace prefix', async () => {
  sf.fetch = jest.fn().mockResolvedValue({records: [{}]});
  const nsPrefixQuery = `SELECT NamespacePrefix FROM ApexClass WHERE Name='VlocityOrganization'`;
  await sf.fetchNsPrefix();
  expect(sf.nsPrefixQuery()).toBe(nsPrefixQuery);
  expect(sf.fetch).toHaveBeenCalledWith(sf.toQueryUrl(nsPrefixQuery));
});

test('clear data', () => {
  sf.clearData();
  expect(sf.tokenData).toBeNull();
  expect(sf.user).toBeNull();
});

test('lwc url', () => {
  const lwcProps = {
    componentName: 'componentName',
    vfns: 'vlocity_ins',
    methods: [],
    lwcAttrs: {
      title: 'foo',
    },
    refs: [],
  };
  sf.nsPrefix = 'vlocity_ins';
  const buttonLwcUrl = sf.lwcUri(lwcProps);
  const iu = sf.tokenData.instance_url;

  const d = window.btoa(
    JSON.stringify({
      component: 'componentName',
      ns: 'vlocity_ins',
      vfns: 'vlocity_ins',
      methods: [],
      iframeId: null,
      refs: [],
      props: {
        title: 'foo',
      },
    }),
  );
  expect(buttonLwcUrl).toBe(
    `${iu}/apex/MobileLwcSdk?data=${encodeURIComponent(d)}`,
  );
});

test('cards out url', () => {
  const params = {
    layout: 'campaign-detail',
    layoutId: 'a1L6A000001a5ZiUAI',
    ns: 'c',
    params: {
      id: '7013u000000TrdBAAS',
    },
  };

  const campaignDetailUrl = sf.cardsOutUri(params);
  const iu = sf.tokenData.instance_url;

  expect(campaignDetailUrl).toBe(
    `${iu}/apex/ConsoleCards?layout=${params.layout}&layoutId=${params.layoutId}&previewMode=Universal&ns=c&id=${params.params.id}`,
  );
});

test('omni out url', () => {
  const params = {
    omniScriptType: 'test',
    subType: 'done',
    language: 'english',
  };
  const testDoneEnglishUrl = sf.omniOutUri(params);
  const iu = sf.tokenData.instance_url;
  expect(testDoneEnglishUrl).toBe(
    `${iu}/apex/OmniScriptUniversalPage?OmniScriptType=${params.omniScriptType}&OmniScriptSubType=${params.subType}&OmniScriptLang=${params.language}`,
  );
});

test('frontdoor', () => {
  const retURL = 'https://my-org.salesforce.com/apex/MyPage';
  const iu = sf.tokenData.instance_url;
  const withFrontDoorUrl = sf.frontDoor(retURL);
  expect(withFrontDoorUrl).toBe(
    `${iu}/secur/frontdoor.jsp?sid=${sf.tokenData.access_token}&retURL=${retURL}`,
  );
});
