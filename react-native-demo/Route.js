import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './LoginScreen';
import AddContactScreen from './AddContactScreen';
import ProfileScreen from './ProfileScreen';
import ContactsScreen from './ContactsScreen';

import CardDemoScreen from './CardDemoScreen';
import ContactDetailScreen from './ContactDetailsScreen';

const RootStack = createStackNavigator();
const Tab = createBottomTabNavigator();
const ContactStack = createStackNavigator();

const Contacts = () => (
  <ContactStack.Navigator>
    {/* <ContactStack.Screen name="Demo" component={CardDemoScreen} /> */}
    <ContactStack.Screen name="ContactList" component={ContactsScreen} />
    <ContactStack.Screen name="AddContact" component={AddContactScreen} />
    <ContactStack.Screen
      name="ContactDetails"
      component={ContactDetailScreen}
    />
  </ContactStack.Navigator>
);

const MainTabs = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Contacts" component={Contacts} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const Route = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator>
        <RootStack.Screen
          name="Login"
          component={LoginScreen}
          options={{headerShown: false}}
        />
        <RootStack.Screen
          name="Main"
          component={MainTabs}
          options={{headerShown: false}}
        />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default Route;
