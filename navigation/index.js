import { NavigationContainer, DrawerActions } from '@react-navigation/native';
import {
    createDrawerNavigator
  } from '@react-navigation/drawer';
  import 'localstorage-polyfill';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Location  from 'expo-location';
// import messaging from '@react-native-firebase/messaging';
import { useDispatch, useSelector } from 'react-redux';
import { toastClick } from '../redux/actions';
import i18n from 'i18n-js';
import Toast from 'react-native-toast-message';
import { directus } from '../constants';
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
import Chats from '../components/Chats';


export default function Navigation(){
  return(
    <NavigationContainer>
        <RootNavigtor />
    </NavigationContainer>
  )
}

function MyTab({route}) {
  
    return (
      <Tab.Navigator
      useLegacyImplementation
      screenOptions={{headerShown: false}}>
        
          <Tab.Screen name="My Profile" component={Profile} />
          <Tab.Screen name="My Chats" component={Chats} />
          <Tab.Screen name="My Jobs" component={Jobs} />
          <Tab.Screen name="Incoming Jobs" component={IncomingJobs} />
  
      </Tab.Navigator>  
    );
}

function RootNavigtor(){

    const dispatch = useDispatch();
    const [loading, setLoading] = React.useState(false);
    const storeState = useSelector(state => state.userReducer);
    const userData = storeState.user;
    const [region, setRegion] = React.useState();

    async function handleNotification(){
        dispatch(toastClick(true));
        Toast.hide();
    }

    async function getLocationAsync(){
      let { status } = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted'){
        alert(i18n.t('noPermission'));
          return;
      }
      let location = await Location.getCurrentPositionAsync({accuracy : Location.Accuracy.Lowest});
      let current_region = {
        longitude : location.coords.longitude,
        latitude: location.coords.latitude,
      }

      if(JSON.stringify(current_region) !== JSON.stringify(region) && Object.keys(userData).length > 0){ //change in db
        await directus.items('workers').updateOne(userData.id, {
          longitude: current_region.longitude,
          latitude: current_region.latitude
        }).then(() => {
          setRegion(current_region);
        })
      }
    }

    React.useState(() => {
      const interval = setInterval(() => {
          getLocationAsync();
      },5000); //5 seconds update
      return(() => {
        clearInterval(interval)
    })
    },[]);
    

    // messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    //     handleNotification()
    // });
        
    // messaging().getInitialNotification(async (remoteMessage) => {
    // });

    // React.useEffect(() => {
    //     messaging().onMessage(async remoteMessage => {
    //       Toast.show({
    //         type: 'success',
    //         text1: remoteMessage.notification.title,
    //         text2: remoteMessage.notification.body,
    //         onPress: () => {console.log("clicked"), handleNotification()}
    //       })
    //     });
    
    //     messaging().onNotificationOpenedApp(async (remoteMessage) => {
    //       handleNotification()
    //     });
    
    // },[]);

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



