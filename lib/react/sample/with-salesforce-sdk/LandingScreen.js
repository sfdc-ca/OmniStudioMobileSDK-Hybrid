import React, { useCallback, useEffect } from 'react';
import { View, Text, Alert } from 'react-native';
import { oauth } from 'react-native-force';
import { useSf } from 'omni-studio-mobile-sdk-react';

const LandingScreen = ({ navigation }) => {
  const { sf } = useSf();

  const auth = useCallback(() => {
    oauth.getAuthCredentials(
      async (data) => {
        const tokenData = {
          instance_url: data.instanceUrl,
          access_token: data.accessToken,
          id: data.userId,
          refresh_token: data.refreshToken,
        };
        await sf.setTokenData(tokenData);
        navigation.replace('Contacts');
      }, // already logged in
      () => {
        oauth.authenticate(
          (data) => {
            const tokenData = {
              instance_url: data.instanceUrl,
              access_token: data.accessToken,
              id: data.userId,
              refresh_token: data.refreshToken,
            };
            sf.setTokenData(tokenData);
          },
          (error) => Alert.alert('Failed to authenticate')
        );
      }
    );
  });

  useEffect(() => {
    auth();
  }, [auth]);

  return (
    <View>
      <Text>Loading...</Text>
    </View>
  );
};

export default LandingScreen;
