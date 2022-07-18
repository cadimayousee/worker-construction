import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, TextInput, Button as Button2} from 'react-native';
import { Input, NativeBaseProvider, Button, Icon, Box, AspectRatio } from 'native-base';
import { FontAwesome5, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
// import download from "../assets/download.jpg";
import { Directus } from '@directus/sdk';
import request from '../request';
import { Loading } from './Loading';
import axios from 'axios';
import * as Location  from 'expo-location'
import i18n from 'i18n-js';

export default function Signup({navigation}) {
    const [firstName, setFirstName] = React.useState('');
    const [lastName, setLastName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [pass, setPass] = React.useState('');
    const [confirmPass, setConfirmPass] = React.useState('');
    const [categories, setCategories] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const directus = new Directus('https://iw77uki0.directus.app');
    

    function validateFormat(text){
      let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
      if (reg.test(text) === false) {
        return false;
      }
      else {
        return true;
      }
    }  

    async function getLocationAsync(){
      let { status } = await Location.requestForegroundPermissionsAsync();
      if(status !== 'granted'){
        alert(i18n.t('noPermission'));
          return;
      }
      let location = await Location.getCurrentPositionAsync({accuracy : Location.Accuracy.Lowest});
      let region = {
        longitude : location.coords.longitude,
        latitude: location.coords.latitude,
      }
      return region;
    }
    
    async function register(){
      var flag = false;

        if(pass !== confirmPass){
            setLoading(false);
            alert(i18n.t('noPassMatch'));
            flag = true;
            return;
        }

        if(firstName =='' || lastName == '' || pass == '' || email == '' || confirmPass == '' || categories == ''){
            setLoading(false);
            alert(i18n.t('emptyFields'));
            flag = true;
            return;
        }

        const valid = validateFormat(email);

        if(valid == false){
          setLoading(false);
          alert(i18n.t('invalidEmail'));
          flag = true;
          return;
        }

        if(valid == true && flag == false){
          await directus.items('workers').readByQuery({
            filter: {
              email : email
            },
          })
          .then(async (res) => {
            if(res.data.length > 0){ //user exists
              setLoading(false);
              alert(i18n.t('userExists'));
              return;
            }
            else{
              var location = await getLocationAsync(); 
              await directus.items('workers').createOne({
                first_name: firstName,
                last_name: lastName,
                email: email,
                password: pass,
                now_status: "online",
                category: categories,
                longitude: location.longitude,
                latitude: location.latitude
                // notification token
              })
              .then((res) => {
                  setLoading(false);
                  navigation.navigate('Tabs',{id: res.id});
              });
            }
          });
        }

    }

  return (
    <NativeBaseProvider>

        {loading && <Loading />}

        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.container}>
        <View style={styles.Middle}>
            <Text style={styles.LoginText}>{i18n.t('signup')}</Text>
        </View>
        <View style={styles.text2}>
            <Text>{i18n.t('alreadyAcc')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Login")} ><Text style={styles.signupText}> {i18n.t('login')} </Text></TouchableOpacity>
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
                value={firstName}
                onChangeText={(text) => setFirstName(text)}
                placeholder={i18n.t('firstName')}
                _light={{
                placeholderTextColor: "blueGray.400",
                }}
                _dark={{
                placeholderTextColor: "blueGray.50",
                }}

            />
            </View>
            
        </View>
        
        {/* Username or Email Input Field */}
        <View style={styles.buttonStyleX}>
            
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
                value={lastName}
                onChangeText={(text) => setLastName(text)}
                placeholder={i18n.t('lastName')}
                _light={{
                placeholderTextColor: "blueGray.400",
                }}
                _dark={{
                placeholderTextColor: "blueGray.50",
                }}

            />
            </View>
        </View>

        {/* Username or Email Input Field */}
        <View style={styles.buttonStyleX}>
            
            <View style={styles.emailInput}>
            <Input
                InputLeftElement={
                <Icon
                    as={<MaterialCommunityIcons name="email" />}
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
                value={email}
                onChangeText={(text) => setEmail(text)}
                placeholder={i18n.t('email')}
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
                value={pass}
                secureTextEntry={true}
                onChangeText={(text) => setPass(text)}
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
                value={confirmPass}
                secureTextEntry={true}
                onChangeText={(text) => setConfirmPass(text)}
                placeholder={i18n.t('confirmPass')}
                _light={{
                placeholderTextColor: "blueGray.400",
                }}
                _dark={{
                placeholderTextColor: "blueGray.50",
                }}
            />
            </View>
        </View>

      {/* Categories Input Field */}
        <View style={styles.buttonStyleX}>
            
            <View style={styles.emailInput}>
            <Input
                InputLeftElement={
                <Icon
                    as={<FontAwesome5 name="clipboard-list" />}
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
                value={categories}
                onChangeText={(text) => setCategories(text)}
                placeholder={i18n.t('categories')}
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
                register()
            }}>
                {i18n.t('registerNow')}
            </Button>
        </View>
        

        <StatusBar style="auto" />
        {/* <Image source={download} style={styles.image}/> */}
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
      },
});
