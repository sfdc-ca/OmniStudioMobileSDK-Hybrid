import {MobileVfpageSdk} from './sdk';

if (process.env.MODE === 'production') {
  new MobileVfpageSdk();
}
