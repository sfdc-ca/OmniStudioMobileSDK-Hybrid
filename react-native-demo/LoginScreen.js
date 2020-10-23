import React, {useEffect, useState} from 'react';
import {Linking, Text, Image, View, StyleSheet} from 'react-native';
import {LoginButton, useSf} from 'mobile-hybrid-sdk/react';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import CookieManager from '@react-native-community/cookies';
import LoadingView from './LoadingView';

const LoginScreen = ({navigation}) => {
  const [loading, setLoading] = useState(false);
  const {sf} = useSf();

  useEffect(() => {
    /**
     * Process login from the callback url.
     */
    const callback = async (urlEvent) => {
      setLoading(true);
      try {
        const {user, tokenData} = await sf.init(urlEvent.url);
        const {access_token} = tokenData;

        await AsyncStorage.setItem('@token', JSON.stringify(tokenData));
        await setCookieToken(access_token);
        setLoading(false);
        success(user);
      } catch (e) {
        setLoading(false);
      }
    };

    Linking.addEventListener('url', callback);
  }, []);

  useEffect(() => {
    // Check from storage
    (async () => {
      setLoading(true);
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
        })();
        if (user) {
          await sf.fetchNsPrefix();
          await setCookieToken(tokenData.access_token);
          success(user);
        }
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);

  async function setCookieToken(accessToken) {
    await Promise.all(
      sf.cookieUrls().map((urlItem) => {
        return CookieManager.set(
          urlItem,
          {
            value: accessToken,
            name: 'sid',
          },
          true,
        );
      }),
    );
  }

  function success(user) {
    sf.setUser(user);

    navigation.replace('Main');
    setLoading(false);
  }

  return (
    <View style={styles.root}>
      <LottieView
        source={require('./assets/7885-codey-riding-a-rocket.json')}
        autoPlay
        loop
      />
      <View style={styles.shadow}>
        <LinearGradient
          style={styles.btnWrapper}
          start={{x: 0.0, y: 0}}
          end={{x: 1.0, y: 1.0}}
          colors={['#6a34ff', '#1893d1']}>
          <LoginButton style={styles.button}>
            <Text style={styles.btnText}>Salesforce Login</Text>
          </LoginButton>
        </LinearGradient>
      </View>
      <Image
        resizeMode="cover"
        source={require('./assets/bg1.jpg')}
        style={styles.bgImage}
      />
      {loading && <LoadingView />}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#efefef',
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 18,
  },
  bgImage: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
    opacity: 0.05,
  },
  logoContainer: {
    borderRadius: 110,
    backgroundColor: '#fafafa',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  btnWrapper: {
    marginBottom: 150,
    borderRadius: 12,
  },
  btnText: {
    fontSize: 23,
    color: 'white',
  },
  shadow: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 5,

    elevation: 5,
  },
});

export default LoginScreen;
