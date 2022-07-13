import * as React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, Image, FlatList, TouchableOpacity} from 'react-native';
import { NavigationContainer, DrawerActions } from '@react-navigation/native';
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
import 'react-native-get-random-values'          
import { fireDB } from './firebase';
import { Directus } from '@directus/sdk';
import * as Localization from 'expo-localization';
import i18n from 'i18n-js';
import { I18nManager } from 'react-native';
import localized_strings from './i18n/supportedLanguages';
import {Ionicons} from '@expo/vector-icons'; 
import Login from './components/Login';
import Signup from "./components/Signup";
import Reset from "./components/Reset";
import OTP from "./components/OTP";
import ChangePassword from "./components/ChangePassword";                    
import profile from "./assets/profile.jpg";
import styles from './styles';
import Profile from './components/Profile';
import Settings from './components/Settings';
import DummyPage from "./components/DummyPage";
import EditProfile from "./components/EditProfile";
import SettingsPassword from './components/SettingsPassword';

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
    console.log("locale " + i18n.locale);
  },[]);

  return (
    <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Drawer" component={MyDrawer} />
            <Stack.Screen name="Signup" component={Signup} />
            <Stack.Screen name="Reset" component={Reset} />
            <Stack.Screen name="OTP" component={OTP} />
            <Stack.Screen name="ChangePassword" component={ChangePassword} />
            <Stack.Screen name="Profile" component={Profile} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen name="DummyPage" component={DummyPage} />
            <Stack.Screen name="EditProfile" component={EditProfile} />
            <Stack.Screen name="SettingsPassword" component={SettingsPassword} />
          </Stack.Navigator>
        </NavigationContainer>
    </SafeAreaProvider>
  );
}

function Item({ item, navigate, userData}) {
  return (
    <TouchableOpacity style={styles.listItem} onPress={()=> item.name == i18n.t('logout') ? navigate('Login') 
    : item.name == i18n.t('profile') ?  navigate('Profile',{userData}) 
    : item.name == i18n.t('settings') ? navigate('Settings',{userData}) : null}>
      <Ionicons name={item.icon} size={32} />
      <Text style={styles.title}>{item.name}</Text>
    </TouchableOpacity>
  );
}

function CustomDrawerContent(props) {
  const id = props.state.routes[0].params;
  const [userData, setUserData] = React.useState();

  async function getData(){
    await directus.items('users').readOne(id.id)
    .then(async(res) => {
      if(Object.keys(res).length !== 0){ //got user 
        setUserData(res);
      }
    })
    .catch((error) => {
      alert(error);
    });
  }

  React.useEffect(() => {
    getData();
  },[]);

  const state = {
    routes:[
        {
          name:i18n.t('postJob'),
          icon:"create-outline"
        },
        {
            name: i18n.t('profile'),
            icon:"person-circle-outline"
        },
        {
            name:i18n.t('settings'),
            icon:"settings-outline"
        },
        {
          name:i18n.t('logout'),
          icon:"exit-outline"
        }
    ]
}
// {...props}
  return (
    <View style={styles.container}>
              <Image source={profile} style={styles.profileImg}/>
              <Text style={styles.name_text}>{userData?.first_name + " " + userData?.last_name}</Text> 
              <Text style={styles.email_text}>{userData?.email}</Text> 
              <View style={styles.sidebarDivider}></View>
              <FlatList
                  style={styles.flatList}
                  data={state.routes}
                  renderItem={({ item }) => <Item  item={item} navigate={props.navigation.navigate} userData={id}/>}
                  keyExtractor={item => item.name}
              />
          </View>
  );
}

function MyDrawer({route}) {
  const userData = route.params;

  return (
    <Drawer.Navigator
      useLegacyImplementation
      screenOptions={{headerShown: false}}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      {/* <Drawer.Screen name="Home" component={Home} initialParams={userData}/> */}
    </Drawer.Navigator>
  );
}
