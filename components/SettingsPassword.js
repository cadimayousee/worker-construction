import React from 'react';
import { StyleSheet, Text, View, FlatList, Button, TextInput} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import i18n from 'i18n-js';
// import messaging from '@react-native-firebase/messaging';
import { directus } from '../constants';
import { useSelector, useDispatch } from 'react-redux';
import { addUser } from '../redux/actions';


function Item({item, setOldPassword, setNewPassword, setConfirmPassword}) {
    return (
        <View style={styles.listItem}>
            <Text style={styles.title}>{item.name + "   "}</Text>
            <TextInput 
            style={styles.textInput}
            placeholder={item.placeholder}
            secureTextEntry={true}
            onChangeText={(text) => item.id == 0 ? setOldPassword(text) 
                : item.id == 1 ? setNewPassword(text) 
                : item.id == 2 ? setConfirmPassword(text) : null}
            >
            </TextInput>
        </View>
    );
}

export default function SettingsPassword({route,navigation}){
    const storeState = useSelector(state => state.userReducer);
    const userData = storeState.user;
    const id = route.params?.userData;
    const [loading, setLoading] = React.useState(false);
    const [oldPassword, setOldPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const dispatch = useDispatch();

    const state = {
        routes:[
            {
                id: 0,
                name: i18n.t('oldPassword'),
                placeholder: i18n.t('oldPassword')
            },
            {
                id: 1,
                name:i18n.t('newPassword'),
                placeholder: i18n.t('newPassword')
            },
            {
                id: 2,
                name:i18n.t('confirmPassword'),
                placeholder: i18n.t('confirmPassword')
            }
        ]
    }

    async function logout(){
        //patch
        await directus.items('workers').updateOne(userData.id, {
            now_status: "offline"
        })
        .then((res) =>{
            dispatch(addUser(res));
            messaging().unsubscribeFromTopic('workers').then(() =>{
                setLoading(false);
                alert(i18n.t('relogin2'));
                navigation.navigate('Login')
            })
        })
        .catch((err) => {
            alert(err.message);
        });
    }

    async function changePass(){
        setLoading(true);
        var flag = false;

        if(oldPassword == '' || newPassword == '' || confirmPassword == ''){
            setLoading(false);
            alert(i18n.t('emptyPass'));
            flag = true;
            return;
        }

        if(newPassword !== confirmPassword){
            setLoading(false);
            alert(i18n.t('noPassMatch'));
            flag = true;
            return;
        }

        if(flag == false){
            await directus.items('workers').readOne(userData.id)
            .then(async(res) => {
                if(Object.keys(res).length !== 0){ //user is correct, verify old password
                var hash_password = res.password;
                await directus.utils.hash.verify(oldPassword, hash_password)
                .then(async (matches) => {
                    if(matches == true){ //old password correct, change password
                        //patch
                    await directus.items('workers').updateOne(userData.id, {
                        password: newPassword
                    })
                    .then((res) =>{
                       logout();
                    })
                    .catch((err) => {
                        setLoading(false);
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
                alert(i18n.t('relogin'));
                }
            })
        }
    }

    return(
        <View style={styles.container}>

            {loading && <Loading />}

            <View style={styles.pageTitle} >
                <Ionicons name={'key-outline'} size={40} />
                <Text style={styles.pageFont}>{i18n.t('changePass')}</Text>
            </View>

            <View style = {[styles.line, {marginTop: 20}]} />

            <FlatList
                style={styles.flatList}
                data={state.routes}
                renderItem={({ item }) => 
                <Item  item={item} setOldPassword={setOldPassword} setNewPassword={setNewPassword} setConfirmPassword={setConfirmPassword}/>}
                keyExtractor={item => item.name}
            /> 

            <View style={{marginBottom: 40}}>
                <Button title='Save' onPress={() => changePass()} />
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