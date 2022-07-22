import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Alert, Linking} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import moment from 'moment';
import i18n from 'i18n-js';
import { fireDB } from '../firebase';
import { useSelector, useDispatch } from 'react-redux';
import { toastClick } from '../redux/actions';
import { directus, firebaseURL, yourServerKey } from '../constants';
import axios from 'axios';

export default function Jobs({route, navigation}){
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const storeState = useSelector(state => state.userReducer);
    const toast = useSelector(state => state.toastReducer);
    const userData = storeState.user;
    const dispatch = useDispatch();
    
    async function handleNotification(){
        if(toast.toastClick){ //toast was clicked
            dispatch(toastClick(false))
        }
    }

    React.useState(() => {
        handleNotification();
    },[]);

    async function getJobs(){
        await directus.items('jobs').readByQuery({filter : {now_status : {_in: ['completed' , 'in progress']}}})
        .then((res) => {    
            res.data.forEach((job) => {
                var arr = [...job.workers];
                if(arr.includes(userData.id)){
                    if(job.now_status == 'in progress'){
                        if(moment().isBefore(moment(job.accepted_time).add(3, 'minutes')))
                            job.can_decline = true;
                    }
                    else{ //completed
                        job.can_decline = false;
                    }
                }
            })
            res.data.sort((a, b) => a.now_status > b.now_status ? -1 : a.now_status < b.now_status ? 1 : 0);
            setJobs(res.data);
        })
        .catch((err) => {
            alert(err);
        })
    }

    useFocusEffect(
        React.useCallback(() => {
          getJobs();
        }, [])
    );

    useFocusEffect(
        React.useCallback(() => {
        const timer = setInterval(() => {
        let data = [...jobs];
        data.forEach((job) => {
            if(job.now_status == 'in progress' && !moment().isBefore(moment(job.accepted_time).add(3, 'minutes')))
                job.can_decline = false;
          })
          data.sort((a, b) => a.now_status > b.now_status ? -1 : a.now_status < b.now_status ? 1 : 0);
          setJobs(data);
        }, 60000); 
        return () => {
            clearInterval(timer);
        };
    }, [jobs])
    );

    async function openChat(contractor_id){

        setLoading(true);

        // //see if an existing chat was created using directus
        // await directus.items('chats').readByQuery({filter : {
        //     contractor: contractor_id,
        //     worker: id,
        // }})
        // .then(async (data) => {
        //     var chat_id;
        //     if(data.data.length > 0){ //chat was opened already 
        //         chat_id = data.data[0].id;
        //     }
        //     else{
        //         await directus.items('chats').createOne({
        //             contractor: contractor_id,
        //             worker: id,
        //         })
        //         .then(async (res) => {
        //             chat_id = res.id;
        //         });
        //     }
        //     await directus.items('workers').readOne(id)
        //     .then((info) => {
        //         setLoading(false);
        //         navigation.navigate('Chat', {chat_id: chat_id, user_id: id, user_info: info, contractor_id: contractor_id});
        //     })
        // })

        //see if an existing chat was created using firebase
        const chats = fireDB.collection('chats');
        var snapshot = chats.where('contractor', '==', contractor_id);
        snapshot = await chats.where('worker', '==', userData.id).get();
        var chat_id;

        if (snapshot.empty) {//create chat document

            const contractor = contractor_id;
            const worker = userData.id;
            const messages = [];

            const new_chat = await fireDB.collection('chats').add({
                messages,
                contractor,
                worker
            });

            chat_id = new_chat.id;
            
        }  
        else{ //chat exists
            snapshot.forEach(async (doc) => {
                chat_id = doc.id;
            });
        }

        setLoading(false);
        navigation.navigate('Chat', {chat_id: chat_id, user_id: userData.id, user_info: userData});

    }

    async function contact(job){
        await directus.items('users').readOne(job.contractor)
        .then((res) => {
            Alert.alert(
                i18n.t('contactAlert'),
                i18n.t('contactDescription'),
                [
                  {
                    text: i18n.t('cancelAlert'),
                    style: "cancel",
                  },
                  {
                    text: i18n.t('phoneAlert'),
                    onPress: () => Linking.openURL(`tel:${res.mobile_number}`),
                    style: "default",
                  },
                  {
                    text: i18n.t('chatAlert'),
                    onPress: () => openChat(res.id),
                    style: "default",
                  },
                ],
                {
                  cancelable: true,
                }
            )
        });
    }

    async function notifyContractor(contractor){
        await axios({
            method: 'post',
            url: firebaseURL,
            headers: {
              "Content-Type": "application/json",
              "Authorization": ['key', yourServerKey].join('=')
            },
            data: {
              to: contractor.notification_token,
              notification: {
                title: i18n.t('notificationTitle2'),
                body: i18n.t('notificationBody2')
              }
            }
        })
    }

    async function declineJob(job){
        setLoading(true);
        var index = jobs.indexOf(job);
        var db_jobs = [...job.workers];
        var worker_index = db_jobs.indexOf(job.id);
        db_jobs.splice(worker_index, 1);
        var request_body;
       if(job.workers.length == 1){ //1 or only worker who accepted
            request_body = {
                now_status: 'created',
                number_of_workers: job.number_of_workers + 1,
                workers: db_jobs
            }
        }
       else{
            request_body = {
            number_of_workers: job.number_of_workers + 1,
            workers: db_jobs
        }
       }
        await directus.items('jobs').updateOne(job.id, request_body).then(() => {
            var updated_jobs = [...jobs];
            updated_jobs.splice(index, 1);
            setJobs(updated_jobs);
            setLoading(false);
        }).then(() => {
            await directus.items('users').readOne(job.contractor).then((contractor) => {
                await directus.items('users').updateOne(job.contractor, {
                    worked_hired : contractor.worked_hired - 1
                })
                //notify contractor
                notifyContractor(contractor);
            })
        })
    }

    return(
        <View style={styles.container}>
            {loading && <Loading />}

        <ScrollView>
            
            {jobs.map((job, index) => {
                {/* Card Component for job */}
                return(
                    <Card key={index}>
                    <Card.Title style={styles.title}>{i18n.t('jobTitle') + job.title}</Card.Title>

                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('jobDescription')+ " "} 
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.description}
                        </Text>
                    </Text>

                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('payAmount')+ " "}
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.pay_amount}
                        </Text>
                    </Text>

                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('hours') + " "}
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.number_of_hours}
                        </Text>
                    </Text>
                    
                    {job.number_of_workers > 0 ?
                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('workersRemaing') + " "}
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.number_of_workers}
                        </Text>
                    </Text> : null}

                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('status') + " "}
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.now_status}
                        </Text>
                    </Text>

                    <Button
                        buttonStyle={styles.viewButton}
                        title={i18n.t('contact')}
                        onPress={() => contact(job)}
                        />
                    {job.can_decline == true? 
                    <Button
                        buttonStyle={styles.declineButton}
                        title={i18n.t('declineJ')}
                        onPress={() => declineJob(job)}
                        />
                     : null} 
                    </Card>
                )
            })}

            {/* Card Component for job */}
            {/* <Card>
            <Card.Title>HELLO WORLD</Card.Title>
            <Text style={{marginBottom: 10}}>
                Some Sort of texting describing job and its details, pay , constructor etc ..
            </Text>
            <Button
                title='VIEW NOW' />
            </Card> */}

        </ScrollView> 
        </View>
    )
}

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1,
    },
    title:{
        fontSize: 18
    },
    titles:{
        fontSize: 16,
        fontWeight: 'bold'
    },
    subtitles:{
        fontSize: 16,
    },
    viewButton:{
        marginTop: 5, 
    },
    declineButton:{
        marginTop: 5, 
        backgroundColor: 'red'
    }
});