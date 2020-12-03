import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { useSf } from './useSf';

/**
 * @param {Object} param
 * @param {string} param.omniScriptType
 * @param {string} param.subType
 * @param {string} param.language
 * @param {Object} param.params
 * @param {string} param.vfpage
 * @param {Object} param.style
 * @param {Function} param.onMessage
 */
const Omniout: React.FC<any> = ({
  omniScriptType,
  subType,
  language,
  params,
  vfpage,
  style,
  onMessage,
}) => {
  const el: any = useRef();
  const { sf }: any = useSf();

  const onViewMessage = (event: any) => {
    const eventData = (() => {
      try {
        return JSON.parse(event.nativeEvent.data);
      } catch (e) {
        return event.nativeEvent.data;
      }
    })();
    if (onMessage) {
      onMessage(eventData);
    }
  };
  const uri = sf.omniOutUri(
    { omniScriptType, subType, language, params },
    vfpage
  );
  const source = { uri };

  return (
    <WebView ref={el} style={style} source={source} onMessage={onViewMessage} />
  );
};

export default Omniout;
