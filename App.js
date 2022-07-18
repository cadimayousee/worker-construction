import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, Image, FlatList, TouchableOpacity} from 'react-native';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import 'react-native-gesture-handler';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import 'localstorage-polyfill';
const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createMaterialTopTabNavigator();
import 'react-native-get-random-values'          
import { fireDB } from './firebase';
import { Directus } from '@directus/sdk';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { I18nManager } from 'react-native';
import localized_strings from './i18n/supportedLanguages';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

import Login from './components/Login';
import Signup from "./components/Signup";
import Reset from "./components/Reset";
import OTP from "./components/OTP";
import ChangePassword from "./components/ChangePassword";                    
import Profile from './components/Profile';
import Settings from './components/Settings';
import DummyPage from "./components/DummyPage";
import EditProfile from "./components/EditProfile";
import SettingsPassword from './components/SettingsPassword';
import Jobs from './components/Jobs';
import IncomingJobs from './components/IncomingJobs';
import Chat from './components/Chat';

const directus = new Directus('https://iw77uki0.directus.app');

export default function App() {
  React.useEffect(() => {
    i18n.translations = localized_strings;
    const locale = Localization.locale;
    i18n.locale = locale;
    i18n.fallbacks = true;

    if(i18n.locale.includes('ar')) { //arabic so support rtl
      I18nManager.allowRTL(true);  
      I18nManager.forceRTL(true); 
    }
    else{
      I18nManager.allowRTL(false);  
      I18nManager.forceRTL(false); 
    }
  },[]);

  React.useEffect(() => {
    messaging().onMessage(async remoteMessage => {
      Toast.show({
        type: 'success',
        text1: remoteMessage.notification.title,
        text2: remoteMessage.notification.body
      });
    });
  },[]);


  return (
    <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Tabs" component={MyTab} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Reset" component={Reset} />
            <Stack.Screen name="OTP" component={OTP} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="DummyPage" component={DummyPage} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="SettingsPassword" component={SettingsPassword} />
            <Stack.Screen name="Chat" component={Chat} />
          </Stack.Navigator>
        </NavigationContainer>
        <Toast />
    </SafeAreaProvider>
  );
}


function MyTab({route}) {
  const userData = route.params;
  //location update

  return (
    <Tab.Navigator
    useLegacyImplementation
    screenOptions={{headerShown: false}}>
      
        <Tab.Screen name="My Profile" component={Profile} initialParams={userData}/>
        <Tab.Screen name="My Jobs" component={Jobs} initialParams={userData}/>
        <Tab.Screen name="Incoming Jobs" component={IncomingJobs} initialParams={userData}/>

    </Tab.Navigator>  
  );
}
