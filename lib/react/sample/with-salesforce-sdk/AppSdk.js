import React from "react";

import { SfProvider } from "omni-studio-mobile-sdk-react";

import Routes from "./Routes";
import config from "./config";

export const AppSdk = () => {
  return (
    <SfProvider config={config}>
      <Routes />
    </SfProvider>
  );
};

export default AppSdk;
