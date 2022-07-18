import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image} from 'react-native';
import { Input, NativeBaseProvider, Icon, Box, AspectRatio, Button } from 'native-base';
import { FontAwesome5 } from '@expo/vector-icons';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import messaging from '@react-native-firebase/messaging';
import i18n from 'i18n-js';


export default function Login({navigation}) {

    const [email, setEmail] = React.useState('esraa@cadimayouseeit.com');
    const [pass, setPass] = React.useState('12345');
    const [loading, setLoading] = React.useState(false);
    const [token, setToken] = React.useState('');
    const directus = new Directus('https://iw77uki0.directus.app');

    async function requestToken() {
      let token;
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
      if (enabled) {
        console.log('Authorization status:', authStatus);
      }
      await messaging().getToken().then(async (token) => {
        console.log("TOKEN " + token);
        await messaging().subscribeToTopic('workers')
        .then(() => { 
          console.log('subscribed!');
          return token;
        })
      })
    }

    async function login(){
      await directus.items('workers').readByQuery({
        filter: {
          email: email
        },
      }).then(async(res) => {
        var user_id = res.data[0]?.id;
        if(res.data.length > 0){ //user with this email exists
          var hash_password = res.data[0].password;
          await directus.utils.hash.verify(pass, hash_password)
          .then(async (matches) => {
            if(matches == true){ //account valid
               //patch
                await directus.items('workers').updateOne(user_id, {
                  now_status: "online",
                  notification_token: token
                })
                .then((res) =>{
                  setLoading(false);
                  navigation.navigate('Tabs', {id: user_id});
                })
                .catch((err) => {
                  alert(err.message);
                });
            }
            else{ //incorrect password
              setLoading(false);
              alert(i18n.t('wrongPassword'))
            }
          })
        }
        else{
          setLoading(false);
          alert(i18n.t('wrongEmail'));
        }
      })
    }

    React.useEffect(() => {
      requestToken().then((res) => setToken(res));
    },[]);

  return (
    <NativeBaseProvider>
       {loading && <Loading />}
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>

        <View style={styles.Middle}>
          <Text style={styles.LoginText}>{i18n.t('login')}</Text>
        </View>
        <View style={styles.text2}>
          <Text>{i18n.t('noAccount')} </Text>
          <TouchableOpacity onPress={() => {navigation.navigate('Signup')}} ><Text style={styles.signupText}> {i18n.t('signup')}</Text></TouchableOpacity>
        </View>

        {/* Username or Email Input Field */}
        <View style={styles.buttonStyle}>
          
          <View style={styles.emailInput}>
            <Input
              InputLeftElement={
                <Icon
                  as={<FontAwesome5 name="user-secret" />}
                  size="sm"
                  m={2}
                  _light={{
                    color: "black",
                  }}
                  _dark={{
                    color: "gray.300",
                  }}
                />
              }
              variant="outline"
              placeholder= {i18n.t('email')}
              value={email}
              onChangeText={(text) => setEmail(text)}
              _light={{
                placeholderTextColor: "blueGray.400",
              }}
              _dark={{
                placeholderTextColor: "blueGray.50",
              }}

            />
          </View>
        </View>

        {/* Password Input Field */}
        <View style={styles.buttonStyleX}>
          
          <View style={styles.emailInput}>
            <Input
              InputLeftElement={
                <Icon
                  as={<FontAwesome5 name="key" />}
                  size="sm"
                  m={2}
                  _light={{
                    color: "black",
                  }}
                  _dark={{
                    color: "gray.300",
                  }}
                />
              }
              variant="outline"
              secureTextEntry={true}
              onChangeText={(text) => setPass(text)}
              value={pass}
              placeholder={i18n.t('password')}
              _light={{
                placeholderTextColor: "blueGray.400",
              }}
              _dark={{
                placeholderTextColor: "blueGray.50",
              }}
            />
          </View>
        </View>
        
        <View style={styles.buttonStyleX}>
          
        <View style={styles.text3}>
          <Text>{i18n.t('forgotPassword')}{" "}</Text>
          <TouchableOpacity onPress={() => {navigation.navigate('Reset')}} ><Text style={styles.signupText}>{i18n.t('clickToReset')}</Text></TouchableOpacity>
        </View>
        </View>
       
        {/* Button */}
        <View style={styles.buttonStyle}>

        <Button style={styles.buttonDesign} onPress={() => {
                setLoading(true), 
                login()
            }}>
               {i18n.t('login')}
            </Button>
            
        </View>

        <StatusBar style="auto" />

        </View>
      </TouchableWithoutFeedback>
    </NativeBaseProvider>
  );
}



export const styles = StyleSheet.create({
  container: {
      flex: 1,
      backgroundColor: '#fff',
    },
    LoginText: {
      marginTop:100,
      fontSize:30,
      fontWeight:'bold',
    },
    Middle:{
      alignItems:'center',
      justifyContent:'center',
    },
    text2:{
      flexDirection:'row',
      justifyContent:'center',
      paddingTop:5
    },
    text3:{
      flexDirection:'row',
      justifyContent:'flex-start',
      paddingTop:5
    },
    signupText:{
      fontWeight:'bold'
    },
    emailField:{
      marginTop:30,
      marginLeft:15
    },
    emailInput:{
      marginTop:10,
      marginRight:5
    },
    buttonStyle:{
      marginTop:30,
      marginLeft:15,
      marginRight:15
    },
    buttonStyleX:{
      marginTop:12,
      marginLeft:15,
      marginRight:15
    },
    buttonDesign:{
      backgroundColor:'#026efd'
    },
    lineStyle:{
      flexDirection:'row',
      marginTop:30,
      marginLeft:15,
      marginRight:15,
      alignItems:'center'
    },
    imageStyle:{
      width:80,
      height:80,
      marginLeft:20,
    },
    boxStyle:{
      flexDirection:'row',
      marginTop:30,
      marginLeft:15,
      marginRight:15,
      justifyContent:'space-around'
    },
    image:{
      flex: 1,
      width: null,
      height: null,
      resizeMode: 'contain'
    }
});
