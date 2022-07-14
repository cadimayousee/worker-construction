import * as React from 'react';
import { View , Text , Platform, StyleSheet, Dimensions, FlatList, TouchableOpacity} from 'react-native';
import i18n from 'i18n-js';
import {Ionicons} from '@expo/vector-icons'; 
import { Directus } from '@directus/sdk';

const directus = new Directus('https://iw77uki0.directus.app');

async function logout(userData, navigate){
    //patch
    await directus.items('workers').updateOne(userData.id, {
        now_status: "offline"
    })
    .then((res) =>{
        navigate('Login')
    })
    .catch((err) => {
        alert(err.message);
    });
}

function options(name, navigate, userData){

    if(name == i18n.t('terms') || name == i18n.t('privacyPolicy') || name == i18n.t('help')) //need to write this later
        navigate('DummyPage')

    if(name == i18n.t('logout')){
        logout(userData, navigate)
    }

    if(name == i18n.t('editProfile')) 
        navigate('EditProfile',{userData});

    if(name == i18n.t('changePass'))
        navigate('SettingsPassword',{userData});
}

function Item({item, navigate, userData}) {
    return (
        <TouchableOpacity style={styles.listItem} onPress={()=> options(item.name, navigate, userData)}>
            <Ionicons name={item.ficon} size={32} />
            <Text style={styles.title}>{item.name + "   "}</Text>
            <Ionicons name={item.icon} size={28} color="grey" />
        </TouchableOpacity>
    );
  }

export default function Settings({route,navigation}){

    const id = route.params?.userData;

    const state = {
        routes:[
            {
                ficon: "pencil",
                name: i18n.t('editProfile'),
                icon:"chevron-forward"
            },
            {
                ficon: "ios-globe-outline",
                name: i18n.t('changeLanguage'),
                icon:"chevron-forward"
            },
            {
                ficon: "key-outline",
                name: i18n.t('changePass'),
                icon:"chevron-forward"
            },
            {
                ficon: "md-reader-outline",
                name: i18n.t('terms'),
                icon:"chevron-forward"
            },
            {
                ficon: "md-shield-checkmark",
                name: i18n.t('privacyPolicy'),
                icon:"chevron-forward"
            },
            {
                ficon: "md-information-circle-outline",
                name: i18n.t('help'),
                icon:"chevron-forward"
            },
            {
                ficon: "md-star-sharp" ,
                name: i18n.t('rateApp'),
                icon:""
            },
            {
                ficon: "exit-outline" ,
                name:i18n.t('logout'),
                icon:""
            },
        ]
    }

    return(
        <View style={styles.container}>

            <View style={styles.pageTitle} >
                <Ionicons name={'settings-outline'} size={40} />
                <Text style={styles.pageFont}>{i18n.t('settings')}</Text>
            </View>

            <FlatList
                  style={styles.flatList}
                  data={state.routes}
                  renderItem={({ item }) => <Item  item={item} navigate={navigation.navigate} userData={id}/>}
                  keyExtractor={item => item.name}
              />

            <Text style={styles.subTitle}>{i18n.t('copyright')}</Text>

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
    listItem:{
        height:60,
        alignItems:"center",
        flexDirection:"row",
    },
    flatList:{
        width:"100%",
        alignSelf: 'center',
        marginTop: 20,
        marginLeft:Dimensions.get('screen').width /3 ,
    },
    title:{
        fontSize:18,
        marginLeft:20
    },
    subTitle:{
        fontSize:15,
        marginBottom: 15,
        color: 'grey'
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
    }
});