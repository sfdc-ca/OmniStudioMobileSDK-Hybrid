import React, { createContext, useContext } from 'react';
const { Salesforce } = require('omni-studio-mobile-sdk-javascript');

const sfContext = createContext({});

type Config = {
  callbackUrl: string;
  clientId: string;
  authUrl: string;
  apiVersion: string;
  responseType: string;
};

type Props = {
  config: Config;
};

export const SfProvider: React.FC<Props> = ({ children, config }) => {
  const sf = useProvideSf(config);

  return <sfContext.Provider value={sf}>{children}</sfContext.Provider>;
};

export function useProvideSf(config: any) {
  const sf = new Salesforce(config);

  return { sf };
}

export const useSf = () => useContext(sfContext);
