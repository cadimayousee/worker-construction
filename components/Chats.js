import React from 'react';
import { View, Image, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Card } from 'react-native-elements'
import i18n from 'i18n-js';
import moment from 'moment';
import { directus } from '../constants';
import { firebase, fireDB } from '../firebase';
import { Loading } from './Loading';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

export default function Chats({navigation}){
    const storeState = useSelector(state => state.userReducer);
    const userData = storeState.user;
    const [loading, setLoading] = React.useState(false);
    const [chatDocs, setChatDocs] = React.useState([]);
    const [changedDocs, setChangedDocs] = React.useState([]);

    async function getChats(){
        await fireDB.collection('chats').where('worker', '==' , userData.id).get().then((res) => {
            var arr = [];
            res.forEach(async (doc) => {
                if(doc.data().messages.length > 0){ //there is messages
                    var chat_document = {id: doc.id, contractor: doc.data().contractor, worker: doc.data().worker, messages: doc.data().messages,
                        contractor_fn: doc.data().contractor_fn, contractor_ln: doc.data().contractor_ln};
                    arr.push(chat_document);
                }
            });
            setChatDocs(arr);
            setChangedDocs([]);
            setLoading(false);
        });
    
    }

    React.useEffect(() => {
        setLoading(true);
        getChats().then(() => {return});
    },[]);

    React.useLayoutEffect(() => {
        const unsubscribe = fireDB.collection('chats').where('worker', '==', userData.id)
        .onSnapshot(snapshot => {
            var arr = [];
            var array = [];

            snapshot.docChanges().forEach((changed_doc) => {
                array.push(changed_doc.doc.id);
            })

            snapshot.forEach(async (doc) => {
                if(doc.data().messages.length > 0){ //there is messages
                    var chat_document = {id: doc.id, contractor: doc.data().contractor, worker: doc.data().worker, messages: doc.data().messages,
                        contractor_fn: doc.data().contractor_fn, contractor_ln: doc.data().contractor_ln};
                    arr.push(chat_document);
                }
            });
            setChatDocs(arr);
            setChangedDocs(array);
        }) 
           
        return unsubscribe;
    },[]);

    async function deleteChat(chat_id, index){
        setLoading(true);
        var arr = [...chatDocs];
        await fireDB.collection('chats').doc(chat_id).delete().then(() => {
            arr.splice(index,1);
            setChatDocs(arr);
            setLoading(false);
        })
    }


    return(
       <View style={styles.container}>

            {loading && <Loading />}

            <View style={styles.pageTitle} >
                <Ionicons name={'md-chatbox-ellipses-outline'} size={40} />
                <Text style={styles.pageFont}>{i18n.t('viewChats')}</Text>
            </View>

            {chatDocs?.map((chat, index) => {
                return(

                    <TouchableOpacity key={index} style={[styles.container_1, changedDocs.includes(chat.id) ? {backgroundColor: '#d7d7d6'} : {backgroundColor: 'white'}]} 
                    onPress={() => 
                        navigation.navigate('Chat', {chat_id: chat.id, user_id: chat.worker, user_info: userData})}>

                        <View style = {styles.leftCol}>
                            <View style={styles.circle}>
                                <Text>{chat.contractor_fn.charAt(0) + "" + chat.contractor_ln.charAt(0)}</Text>
                            </View>
                        </View>

                        <View style={styles.centerCol}>
                            <Text style={styles.name}>{chat.contractor_fn + " " + chat.contractor_ln}</Text>
                            <Text style={styles.subtitle}>{chat.messages[chat.messages.length -1].text}</Text>
                        </View>

                        <TouchableOpacity onPress={() => deleteChat(chat.id, index)} style = {styles.rightCol}>
                            {/* <Ionicons name="hammer-outline" size={25} style={{alignSelf: 'center'}} /> */}
                            <Ionicons name="trash-outline" size={25} style={{alignSelf: 'center'}} />
                        </TouchableOpacity>

                        </TouchableOpacity>
                );
            })}

       </View>
    );
}

const width = Dimensions.get('window').width;

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1,
    },
    circle: {
        width: 40,
        height: 40,
        borderRadius: 40 / 2,
        backgroundColor: "#d7d7d6",
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center'
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
    name:{
        fontSize:18,
        fontWeight: 'bold',
        marginLeft: 40
    },
    subtitle:{
        fontSize:16,
        color: 'grey',
        marginLeft: 40
    },
    container_1:{
        zIndex: 9,
        // position: 'absolute',
        flexDirection: 'row',
        width: width - 40,
        // height: 60,
        // top: 100,
        // left: 20,
        borderRadius: 5,
        // backgroundColor: 'white',
        alignItems: 'center',
        shadowColor: '#000000',
        elevation: 7,
        shadowRadius: 5,
        shadowOpacity: 1.0,
        marginTop: 20
    },
    leftCol:{
        flex: 1,
        alignItems: 'center',
    },
    centerCol:{
        flex: 4
    },
    rightCol:{
        flex: 1,
        borderLeftWidth: 1,
        borderColor: '#ededed',
    },
    searchTextStyle:{
        fontSize: 18,
        color: '#545454'
    }
});
