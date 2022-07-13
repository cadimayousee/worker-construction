import * as React from 'react';
import { View , Text , Platform, StyleSheet, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, TextInput, Button} from 'react-native';
import i18n from 'i18n-js';
import {Ionicons} from '@expo/vector-icons'; 
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import axios from 'axios';
import Toast from 'react-native-root-toast';

const directus = new Directus('https://iw77uki0.directus.app');

function Item({item, setFirstName, setLastName, setMobile, setAddress, setEmail}) {
    return (
        <View style={styles.listItem}>
            <Text style={styles.title}>{item.name + "   "}</Text>
            <TextInput 
            style={styles.textInput}
            placeholder={item.placeholder}
            onChangeText={(text) => item.id == 0 ? setFirstName(text) 
                : item.id == 1 ? setLastName(text) 
                : item.id == 2 ? setMobile(text)
                : item.id == 3 ? setAddress(text) 
                : item.id == 4 ? setEmail(text) : null}
            >
            </TextInput>
        </View>
    );
}

function validate(text){
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false) {
      return false;
    }
    else {
      return true;
    }
  }      

async function saveDetails(userData, firstName, lastName, mobile, address, email, setLoading, navigation){
    setLoading(true);
    var flag = false;

    if(email !== userData?.email){ //changed email
        const valid = validate(email);
        if(valid == false){
            setLoading(false);
            alert(i18n.t('invalidEmail'));
            flag = true;
            return;
        }

        if(valid == true){
            await directus.items('users').readByQuery({
            filter: {
                email : email
            },
            })
            .then((res) => {
                if(res.data.length > 0){ //user exists
                    setLoading(false);
                    alert(i18n.t('userExists'));
                    flag = true;
                    return;
                }
            })
        }
    }

    if(flag == false){
        //patch
        await directus.items('users').updateOne(userData.id, {
            first_name: firstName,
            last_name: lastName,
            mobile_number: mobile,
            address: address,
            email: email
        })
        .then((res) =>{
            setLoading(false);
            alert(i18n.t('relogin2'));
            navigation.navigate('Login');
        })
        .catch((err) => {
            setLoading(false);
            alert(err.message);
        });
    }
}

export default function EditProfile({route,navigation}){
  
    const [loading, setLoading] = React.useState(false);
    const [firstName, setFirstName] = React.useState(userData?.first_name);
    const [lastName, setLastName] = React.useState(userData?.last_name);
    const [mobile, setMobile] = React.useState(userData?.mobile_number);
    const [address, setAddress] = React.useState(userData?.address);
    const [email, setEmail] = React.useState(userData?.email);

    const id = route.params?.userData;
    const [userData, setUserData] = React.useState();

    async function getData(){
        await directus.items('users').readOne(id.id)
        .then(async(res) => {
          if(Object.keys(res).length !== 0){ //got user 
            setUserData(res);
            setLoading(false);
          }
        })
        .catch((error) => {
          alert(error);
        });
      }

    React.useEffect(() => {
        setLoading(true);
        getData();
    },[]);

    const state = {
        routes:[
            {
                id: 0,
                name: i18n.t('firstName'),
                placeholder: userData?.first_name + " ",
            },
            {
                id: 1,
                name:i18n.t('lastName'),
                placeholder: userData?.last_name + " "
            },
            {
                id: 2,
                name:i18n.t('phone'),
                placeholder: userData?.mobile_number == 0 ? 'Not Specified' : userData?.mobile_number + " "
            },
            {
                id: 3,
                name:i18n.t('address'),
                placeholder: userData?.address !== null ? userData?.address + " " : 'Not Specified'
            },
            {
                id: 4,
                name:i18n.t('email'),
                placeholder: userData?.email + " "
            },
        ]
    }

    return(
        <View style={styles.container}>

            {loading && <Loading />}

            <View style={styles.pageTitle} >
                <Ionicons name={'pencil'} size={40} />
                <Text style={styles.pageFont}>{i18n.t('editProfile')}</Text>
            </View>

            <View style = {[styles.line, {marginTop: 20}]} />

            <FlatList
                  style={styles.flatList}
                  data={state.routes}
                  renderItem={({ item }) => 
                  <Item  item={item} setFirstName={setFirstName} setLastName={setLastName} setMobile={setMobile} setAddress={setAddress} setEmail={setEmail}/>}
                  keyExtractor={item => item.name}
            /> 

            <View style={{marginBottom: 40}}>
                <Button title={i18n.t('save')} onPress={() => saveDetails(userData,firstName, lastName, mobile, address, email, setLoading, navigation)} />
            </View>

        </View>
    );
};

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1,
    },
    pageTitle:{
        alignSelf: 'flex-start',
        alignItems:"center",
        flexDirection:"row",
        marginLeft: 15
    },
    pageFont:{
        fontSize:25,
        fontWeight: 'bold',
        marginLeft:20
    },
    line:{
        width: '90%',
        borderWidth: 0.5,
        borderColor: 'grey'
    },
    listItem:{
        height:60,
        alignItems:"center",
        flexDirection:"row",
    },
    flatList:{
        width:"100%",
        alignSelf: 'flex-start',
        marginTop: 30,
        marginLeft: 20,
    },
    title:{
        fontSize:18,
        marginLeft:20
    },
    textInput:{
        fontSize:18,
        marginLeft:10,
    }
});