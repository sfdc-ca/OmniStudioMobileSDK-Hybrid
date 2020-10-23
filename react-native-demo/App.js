import React from 'react';
import {SfProvider} from 'mobile-hybrid-sdk/react';

import Route from './Route';
import config from './config';

const App = () => {
  return (
    <SfProvider config={config}>
      <Route />
    </SfProvider>
  );
};

export default App;
