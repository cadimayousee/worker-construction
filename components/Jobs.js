import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView, Alert, Linking} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import moment from 'moment';
import i18n from 'i18n-js';

const directus = new Directus('https://iw77uki0.directus.app');

export default function Jobs({route, navigation}){
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const id = route.params.id;

    async function getJobs(){
        await directus.items('jobs').readByQuery({filter : {now_status : {_in: ['completed' , 'in progress']}}})
        .then((res) => {    
            res.data.forEach((job) => {
                var arr = [...job.workers];
                if(arr.includes(id)){
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
        //see if an existing chat was created
        await directus.items('chats').readByQuery({filter : {
            contractor: contractor_id,
            worker: id,
        }})
        .then(async (data) => {
            var chat_id;
            if(data.data.length > 0){ //chat was opened already 
                chat_id = data.data[0].id;
            }
            else{
                await directus.items('chats').createOne({
                    contractor: contractor_id,
                    worker: id,
                })
                .then(async (res) => {
                    chat_id = res.id;
                });
            }
            await directus.items('workers').readOne(id)
            .then((info) => {
                setLoading(false);
                navigation.navigate('Chat', {chat_id: chat_id, user_id: id, user_info: info});
            })
        })
    }

    async function contact(job){
        await directus.items('users').readOne(job.contractor)
        .then((res) => {
            Alert.alert(
                "Contact Contractor",
                "You can follow up on the job details by contacting the contractor through phone number or through our chat",
                [
                  {
                    text: "Cancel",
                    style: "cancel",
                  },
                  {
                    text: "Phone",
                    onPress: () => Linking.openURL(`tel:${res.mobile_number}`),
                    style: "default",
                  },
                  {
                    text: "Chat",
                    onPress: () => {openChat(res.id)},
                    style: "default",
                  },
                ],
                {
                  cancelable: true,
                }
            )
        });
    }

    async function declineJob(job){
        setLoading(true);
        var index = jobs.indexOf(job);
        var db_jobs = [...job.workers];
        var worker_index = db_jobs.indexOf(job.id);
        db_jobs.splice(worker_index, 1);
       if(job.workers.length == 1){ //1 or only worker who accepted
        await directus.items('jobs').updateOne(job.id, {
            now_status: 'created',
            number_of_workers: job.number_of_workers + 1,
            workers: db_jobs
        }).then(() => {
            var updated_jobs = [...jobs];
            updated_jobs.splice(index, 1);
            setJobs(updated_jobs);
            setLoading(false);
        })
       }
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