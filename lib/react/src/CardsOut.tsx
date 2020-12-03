import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { useSf } from './useSf';

/**
 * @param {Object} param
 * @param {string} param.layout
 * @param {string} param.layoutId
 * @param {string} param.ns
 * @param {string} param.vfpage
 * @param {Object} param.style
 */
const Cardsout: React.FC<any> = ({
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
