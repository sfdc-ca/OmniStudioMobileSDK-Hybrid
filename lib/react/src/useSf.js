import React, {createContext, useContext} from 'react';
import {Salesforce}  from 'mobile-hybrid-sdk/lib/javascript';

const sfContext = createContext();

export const SfProvider = ({ children, config }) => {
  const sf = useProvideSf(config);

  return <sfContext.Provider value={sf}>{children}</sfContext.Provider>
}

function useProvideSf(config) {
  const sf = new Salesforce(config);

  return {sf};
};

export const useSf = () => useContext(sfContext);
