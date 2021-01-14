import React, { useEffect, useState } from 'react';
import { Pressable, Text, Image, View, StyleSheet, Alert } from 'react-native';
import { useSf } from 'omni-studio-mobile-sdk-react';
import LottieView from 'lottie-react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CookieManager from '@react-native-community/cookies';
import { oauth } from 'react-native-force';
import { profileQuery } from './utils';

import LoadingView from './LoadingView';

const LoginScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const { sf } = useSf();

  const getProfile = async (tokenData) => {
    const endPoint = sf.toQueryUrl(profileQuery(tokenData.id));

    const res = await sf.fetch(endPoint);

    const user = res.records[0];
    sf.setUser(user);
    return user;
  };

  const onLogin = () => {
    oauth.authenticate(
      async (data) => {
        const tokenData = {
          instance_url: data.instanceUrl,
          access_token: data.accessToken,
          id: data.userId,
          refresh_token: data.refreshToken,
        };
        sf.setTokenData(tokenData);
        await AsyncStorage.setItem('@token', JSON.stringify(tokenData));

        const user = await getProfile(tokenData);
        await sf.fetchNsPrefix();
        if (!data.accessToken) {
          return false;
        }
        await setCookieToken(data.accessToken);
        success(user);
      },
      () => Alert.alert('Failed to authenticate')
    );
  };

  useEffect(() => {
    // Check from storage
    (async () => {
      setLoading(true);
      try {
        const storageValue = await AsyncStorage.getItem('@token');
        const tokenData = JSON.parse(storageValue);

        sf.setTokenData(tokenData);
        const user = await getProfile(tokenData);
        if (user) {
          await sf.fetchNsPrefix();
          success(user);
        }
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);

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
          start={{ x: 0.0, y: 0 }}
          end={{ x: 1.0, y: 1.0 }}
          colors={['#6a34ff', '#1893d1']}
        >
          <Pressable onPress={onLogin} style={styles.button}>
            <Text style={styles.btnText}>Salesforce Login</Text>
          </Pressable>
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
