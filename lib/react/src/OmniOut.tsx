import React, { useRef } from 'react';
import { WebView } from 'react-native-webview';

import { useSf } from './useSf';

type Props = {
  omniScriptType: string;
  subType: string;
  language: string;
  params?: Object;
  vfpage?: string;
  style?: any;
  onMessage?: (data: any) => void;
};

const Omniout: React.FC<Props> = ({
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
