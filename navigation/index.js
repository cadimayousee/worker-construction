import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import {
    createDrawerNavigator
  } from '@react-navigation/drawer';
  import 'localstorage-polyfill';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import messaging from '@react-native-firebase/messaging';
import { useDispatch } from 'react-redux';
import { toastClick } from '../redux/actions';
import i18n from 'i18n-js';
import Toast from 'react-native-toast-message';
import * as React from 'react';
const Stack = createNativeStackNavigator();
const Tab = createMaterialTopTabNavigator();

import Login from '../components/Login';
import Signup from "../components/Signup";
import Reset from "../components/Reset";
import OTP from "../components/OTP";
import ChangePassword from "../components/ChangePassword";                    
import Profile from '../components/Profile';
import Settings from '../components/Settings';
import DummyPage from "../components/DummyPage";
import EditProfile from "../components/EditProfile";
import SettingsPassword from '../components/SettingsPassword';
import Jobs from '../components/Jobs';
import IncomingJobs from '../components/IncomingJobs';
import Chat from '../components/Chat';


export default function Navigation(){
  return(
    <NavigationContainer>
        <RootNavigtor />
    </NavigationContainer>
  )
}

function MyTab({route}) {
    //location update
  
    return (
      <Tab.Navigator
      useLegacyImplementation
      screenOptions={{headerShown: false}}>
        
          <Tab.Screen name="My Profile" component={Profile} />
          <Tab.Screen name="My Jobs" component={Jobs} />
          <Tab.Screen name="Incoming Jobs" component={IncomingJobs} />
  
      </Tab.Navigator>  
    );
}

function RootNavigtor(){

    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(false);

    async function handleNotification(){
        dispatch(toastClick(true));
        Toast.hide();
    }

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
        handleNotification()
    });
        
    messaging().getInitialNotification(async (remoteMessage) => {
    });

    React.useEffect(() => {
        messaging().onMessage(async remoteMessage => {
          Toast.show({
            type: 'success',
            text1: remoteMessage.notification.title,
            text2: remoteMessage.notification.body,
            onPress: () => {console.log("clicked"), handleNotification()}
          })
        });
    
        messaging().onNotificationOpenedApp(async (remoteMessage) => {
          handleNotification()
        });
    
    },[]);

    return(
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
    )

}



