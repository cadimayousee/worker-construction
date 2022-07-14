import * as React from 'react';
import 'react-native-gesture-handler';
import Modal from "react-native-modal";
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, Dimensions, FlatList} from 'react-native';
import profileImg from "../assets/profile.jpg";
import {Ionicons} from '@expo/vector-icons'; 
import Toast from 'react-native-root-toast';
import i18n from 'i18n-js';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';

function Item({item, navigate, userData}) {
    return (
        <TouchableOpacity style={styles.listItem} onPress={()=> item.name == i18n.t('settings') ? navigate('Settings',{userData}) : null}>
            <Ionicons name={item.icon} size={32} />
            <Text style={styles.title}>{item.name}</Text>
        </TouchableOpacity>
    );
  }

export default function Profile({route, navigation}){
  const width = Dimensions.get('screen').width;
  const height = Dimensions.get('screen').height;
  const directus = new Directus('https://iw77uki0.directus.app');
  
  const id = route.params;
  const [userData, setUserData] = React.useState();
  const [loading, setLoading] = React.useState(false);

  async function getData(){
    await directus.items('workers').readOne(id.id)
    .then(async(res) => {
      if(Object.keys(res).length !== 0){ //got user 
        setUserData(res);
        setLoading(false);

        //if any of the userdata isnt complete show toast
        if(res?.mobile_number == 0){
          Toast.show(i18n.t('toastString'), {
              duration: Toast.durations.LONG,
              position: 1
          })
      }
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

    var rating;
    if(userData?.rating == 0 || userData?.users_rated == 0){ //not yet rated
      rating = i18n.t('notRated');
    }
    else{
      rating = Math.round(userData?.rating/userData?.users_rated) + " ✭";
    }

    const state = {
        routes:[
            {
                name:i18n.t('settings'),
                icon:"settings-outline"
            },
            // {
            //   name:i18n.t('logout'),
            //   icon:"exit-outline"
            // },
        ]
    }
    
    return (
        <View style={styles.container}>

          {loading && <Loading />}

            <TouchableOpacity style={styles.circle}>
                <Image source={profileImg} style={styles.profileImg}/>
            </TouchableOpacity>

              <Text style={styles.name_text}>{userData?.first_name + " " + userData?.last_name}</Text> 
              {/* <Text style={styles.email_text}>{userData.email}</Text>  */}

              <View style = {styles.profileCategories}>

                    <View style={{alignItems:'center'}}>
                        <Text style={styles.number_text}>0</Text>
                        <Text style={styles.email_text}>{i18n.t('jobsDone')}</Text>
                    </View>

                    <View style={styles.sidebarDivider} />

                    <View style={{alignItems:'center'}}>
                        <Text style={styles.number_text}>0</Text>
                        <Text style={styles.email_text}>{i18n.t('jobsInProgress')}</Text>
                    </View>

                    <View style={styles.sidebarDivider} />

                    <View style={{alignItems:'center'}}>
                        <Text style={styles.number_text}>{rating}</Text>
                        <Text style={styles.email_text}>{i18n.t('rating')}</Text>
                    </View>

              </View>

              <FlatList
                  style={styles.flatList}
                  data={state.routes}
                  renderItem={({ item }) => <Item  item={item} navigate={navigation.navigate} userData={id}/>}
                  keyExtractor={item => item.name}
              />
        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1
      },
      profileCategories:{
        flexDirection: 'row', 
        alignItems: 'center', 
        width: '95%', 
        justifyContent: 'space-around', 
        alignSelf: 'flex-start', 
        marginTop: 20
      },    
      listItem:{
          height:60,
          alignItems:"center",
          flexDirection:"row",
      },
      title:{
          fontSize:18,
          marginLeft:20
      },
      header:{
        width:"100%",
        height:60,
        flexDirection:"row",
        justifyContent:"space-between",
        alignItems:"center",
        paddingHorizontal:20
      },
      profileImg:{
        width:200,
        height:200,
        borderRadius: 200 / 2,
        resizeMode: 'contain'
        // marginTop:20
      },
      sidebarDivider:{
        width:1,
        height:"100%",
        backgroundColor:"lightgray",
        marginHorizontal:10
      },
      name_text:{
        fontWeight:"bold",
        fontSize:25,
        marginTop:10
      },
      number_text:{
        // fontWeight:"bold",
        fontSize:20,
        marginTop:10
      },
      email_text:{
        color:"gray",
        marginBottom:10
      },
      flatList:{
        width:"100%",
        alignSelf: 'center',
        marginTop: 20,
        marginLeft:Dimensions.get('screen').width /3 ,
      },
      circle: {
        width: 200,
        height: 200,
        borderRadius: 200 / 2,
        alignItems: 'center',
        borderColor: 'green',
        borderWidth: 2,
        overflow: 'hidden'
      },
});
