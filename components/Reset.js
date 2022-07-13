import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image} from 'react-native';
import { Input, NativeBaseProvider, Icon, Box, AspectRatio, Button } from 'native-base';
import { FontAwesome5 } from '@expo/vector-icons';
import verify from "../assets/verify.jpg";
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import axios from 'axios';
import i18n from 'i18n-js';

export default function Reset({navigation}){
    const [email, setEmail] = React.useState('esraa@cadimayouseeit.com');
    const [loading, setLoading] = React.useState(false);
    const directus = new Directus('https://iw77uki0.directus.app');
    const api_key = '0bd2d3933c1109a2cb73570a5035c4d44d15ec5df61310d4c40239ad45454097';

    const generateOTP = (length) => {
        const digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < length; i++) {
          OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    };

    async function verifyEmail(){
        await directus.items('users').readByQuery({
            filter: {
              email: email
            },
          }).then(async(res) => {
            if(res.data.length > 0){ //email exists, send OTP and navigate to OTP screen
                const OTP = generateOTP(6);
                await axios({
                    method: "POST",
                    url: `https://api.mailslurp.com/sendEmail?apiKey=${api_key}`,
                    data: {
                        senderId: 'deeef50c-e076-4605-a1fd-abc2c6b823eb',
                        to: email,
                        subject: i18n.t('verifyEmail'),
                        body: `${i18n.t('verifyEmailBody')} ${OTP}`,
                    },
                })
                .then(() => {
                    setLoading(false);
                    navigation.navigate('OTP', [res.data[0].id, OTP]);
                    //navigate to OTP screen
                })
                .catch((error) => {
                    setLoading(false);
                    alert(error.message);
                })
            }
            else{
                setLoading(false);
                alert(i18n.t('wrongEmail'));
            }
          })
          .catch((error) => {
            alert(error.message)
          })
    }

    return (
        <NativeBaseProvider>
            {loading && <Loading />}
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.container}>
    
            <View style={styles.Middle}>
              <Text style={styles.LoginText}>{i18n.t('resetPass')}</Text>
            </View>

            <View style={styles.text2}>
              <Text style={styles.signupText}>{i18n.t('enterEmail')}</Text>
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
                  placeholder={i18n.t('email')}
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
    
            {/* Button */}
            <View style={styles.buttonStyle}>
    
            <Button style={styles.buttonDesign} onPress={() => {
                    setLoading(true),
                    verifyEmail()
                }}>
                   {i18n.t('verifyEmail')}
                </Button>
                
            </View>
    
            <StatusBar style="auto" />
              <Image source={verify} style={styles.image}/>
    
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