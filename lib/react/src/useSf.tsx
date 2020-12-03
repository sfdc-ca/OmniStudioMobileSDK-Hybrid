import React, { createContext, useContext } from 'react';
const { Salesforce } = require('omni-studio-mobile-sdk-javascript');

const sfContext = createContext({});

export const SfProvider: React.FC<any> = ({ children, config }) => {
  const sf = useProvideSf(config);

  return <sfContext.Provider value={sf}>{children}</sfContext.Provider>;
};

export function useProvideSf(config: any) {
  console.log({ Salesforce });
  const sf = new Salesforce(config);

  return { sf };
}

export const useSf = () => useContext(sfContext);
