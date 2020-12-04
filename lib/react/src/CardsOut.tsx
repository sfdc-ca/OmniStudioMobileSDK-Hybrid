import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { useSf } from './useSf';

type Props = {
  layout: string;
  layoutId: string;
  ns?: string;
  params?: any;
  vfpage?: string;
  style?: any;
};

const Cardsout: React.FC<Props> = ({
  layout,
  layoutId,
  ns,
  params,
  vfpage,
  style,
}) => {
  const el: any = useRef();
  const { sf }: any = useSf();

  const source = {
    uri: sf.cardsOutUri({ layout, layoutId, ns, params }, vfpage),
  };

  return <WebView ref={el} style={style} source={source} />;
};

export default Cardsout;
