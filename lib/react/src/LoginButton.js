import React from "react";
import { Pressable, Linking } from "react-native";
import { useSf } from "./useSf";

/**
 * Enhanced button with salesforce login added.
 * @param {Object} props React Native Button props
 */
const LoginButton = (props) => {
  const { sf } = useSf();

  const press = (event) => {
    if (props.onPress) {
      props.onPress(event);
    }
    Linking.openURL(sf.authUrl());
  };

  return <Pressable {...props} onPress={press} />;
};

export default LoginButton;
