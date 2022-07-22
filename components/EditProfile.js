import * as React from 'react';
import { View , Text , Platform, StyleSheet, Dimensions, FlatList, TouchableOpacity, TouchableWithoutFeedback, TextInput, Button} from 'react-native';
import i18n from 'i18n-js';
import {Ionicons} from '@expo/vector-icons'; 
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import messaging from "@react-native-firebase/messaging";
import axios from 'axios';
import { directus } from '../constants';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../redux/actions';

export default function EditProfile({route,navigation}){
    
    const [loading, setLoading] = React.useState(false);
    const storeState = useSelector(state => state.userReducer);
    const userData = storeState.user;
    const [firstName, setFirstName] = React.useState(userData?.first_name);
    const [lastName, setLastName] = React.useState(userData?.last_name);
    const [mobile, setMobile] = React.useState(userData?.mobile_number);
    const [email, setEmail] = React.useState(userData?.email);
    const [category, setCategory] = React.useState(userData?.category);
    const dispatch = useDispatch();

function Item({item}) {
    return (
        <View style={styles.listItem}>
            <Text style={styles.title}>{item.name + "   "}</Text>
            <TextInput 
            style={styles.textInput}
            placeholder={item.placeholder}
            onChangeText={(text) => item.id == 0 ? setFirstName(text) 
                : item.id == 1 ? setLastName(text) 
                : item.id == 2 ? setMobile(text)
                : item.id == 3 ? setCategory(text)
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

async function logout(){
    //patch
    await directus.items('workers').updateOne(userData.id, {
        now_status: "offline"
    })
    .then((res) =>{
        dispatch(addUser(res));
        messaging().unsubscribeFromTopic('workers');
        setLoading(false);
        alert(i18n.t('relogin2'));
        navigation.navigate('Login')
    })
    .catch((err) => {
        alert(err.message);
    });
}

async function saveDetails(){
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
            await directus.items('workers').readByQuery({
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
        await directus.items('workers').updateOne(userData.id, {
            first_name: firstName,
            last_name: lastName,
            mobile_number: mobile,
            email: email,
            category: category
        })
        .then((res) =>{
            logout();
        })
        .catch((err) => {
            setLoading(false);
            alert(err.message);
        });
    }
}

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
                name:i18n.t('category'),
                placeholder: userData?.category + " "
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
                  <Item  item={item} />}
                  keyExtractor={item => item.name}
            /> 

            <View style={{marginBottom: 40}}>
                <Button title={i18n.t('save')} onPress={() => saveDetails()} />
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