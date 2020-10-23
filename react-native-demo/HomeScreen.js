import React, { useEffect, useState } from 'react';
import {
  Button,
  Linking,
  SafeAreaView,
  StyleSheet,
  Text,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import CookieManager from '@react-native-community/cookies';

import {useSf, LoginButton} from 'mobile-hybrid-sdk/react';
import graphConfig from './graphConfig';

const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const {sf} = useSf();

  const setDataToView = (user, accessToken) => {
    setAccessToken(accessToken);
    setUser(user);
  };

  useEffect(() => {
    /**
     * Process login from the callback url.
     */
    const callback = async (urlEvent) => {
      try {
        const {user, tokenData} = await sf.init(urlEvent.url);
        const {access_token} = tokenData;

        await AsyncStorage.setItem('@token', JSON.stringify(tokenData));        
        await setCookieToken(access_token);

        setDataToView(user, tokenData.access_token);        
      } catch (e) { }
    };

    Linking.addEventListener('url', callback);
  }, []);

  useEffect(() => {
    // Check from storage
    (async () => {
      try {
        const storageValue = await AsyncStorage.getItem('@token');
        const tokenData = JSON.parse(storageValue);
        console.log(tokenData.access_token);

        sf.setTokenData(tokenData);
        const user = await (async () => {
          try {
            return await sf.getProfile(tokenData);
          } catch (e) {
            /**
             * It means that the access token has expired. 
             * Needs to request for new token. Then fetch
             * again the user profile data.
             */
            await refresh();
            return await sf.getProfile(tokenData);
          }
        })()
        if (user) {
          await setCookieToken(tokenData.access_token);
          setDataToView(user, tokenData.access_token);
        }
      } catch (e) { }
    })();
  }, []);

  const logout = () => {
    AsyncStorage.clear();
    sf.clearData();
    setUser(null);
  };

  async function setCookieToken(accessToken) {
    await Promise.all(sf.cookieUrls().map(urlItem => {
      return CookieManager.set(urlItem, {
        value: accessToken,
        name: 'sid'
      }, true);
    }));
  }

  /**
   * Request new access token using the refresh token.
   */
  async function refresh() {
    try {
      const tokenData = await sf.requestRefreshToken();
      await AsyncStorage.setItem('@token', JSON.stringify(tokenData));
      if (!tokenData || !tokenData.access_token) {
        return logout();
      }
      setAccessToken(tokenData.access_token);

      await setCookieToken(tokenData.access_token);
      alert('refresh token request success');
    } catch (e) { }
  }

  if (!user) {
    return (
      <SafeAreaView>
        <LoginButton title="Login"/>
      </SafeAreaView>
    )
  }

  const {FirstName, LastName} = user;

  return (
    <SafeAreaView>
      <Button
        onPress={logout}
        title="Logout" />
      <Text style={styles.text}>
        Hello {FirstName} {LastName}
      </Text>
      <Text>Access Token:</Text>
      <Text>{accessToken}</Text>
      <Button
        onPress={refresh}
        title="Refresh Token" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    fontSize: 24,
  },
});

export default HomeScreen;
