import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import moment from 'moment'
import i18n from 'i18n-js';
import { directus, yourServerKey, firebaseURL } from '../constants';
import { useSelector, useDispatch } from 'react-redux';
import { Overlay } from 'react-native-elements';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons'; 
import axios from 'axios';

export default function IncomingJobs({route, navigation}){
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [infoOverlay, setInfoOverlay] = React.useState(false);
    const [contractorData, setContractorData] = React.useState({id: 0, name: 'default'});
    const storeState = useSelector(state => state.userReducer);
    const userData = storeState.user;

    const toggleOverlay_1 = () => {
        setInfoOverlay(!infoOverlay);
    }

    async function getJobs(){
        await directus.items('jobs').readByQuery({ filter: {now_status: 'hiring'}})
        .then((res) => {
            var arr = res.data.filter((job) => !job.workers.includes(userData.id))
            setJobs(arr);
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
                title: i18n.t('notificationTitle'),
                body: i18n.t('notificationBody')
              }
            }
        })
    }

    async function accept(job){
        setLoading(true);
        //check user info 
        if(userData.mobile_number == 0){ //uneligible 
            Toast.show({
                type: 'error',
                text1: i18n.t('toastString')
              });
            setLoading(false);
            return;
        }
        else{
            //patch job 
            await directus.items('jobs').readOne(job.id)
            .then(async (response) => {
                var arr = [...response.workers];
                arr.push(userData.id);
                var request_body;
                if(response.number_of_workers == 1){
                    request_body = {
                        now_status: 'in progress', //if no more workers are required for this job
                        number_of_workers: job.number_of_workers - 1,
                        workers : arr,
                        accepted_time: moment(),
                    }
                }
                else{
                    request_body = {
                        number_of_workers: job.number_of_workers - 1,
                        workers : arr,
                        accepted_time: moment(),
                    }
                }
                await directus.items('jobs').updateOne(job.id, request_body)
                .then(async () => { //hired for job
                    await directus.items('users').readOne(response.contractor).then(async (contractor) => {
                        await directus.items('users').updateOne(response.contractor, {
                            workers_hired : contractor.workers_hired + 1
                        }).then(() => {
                            //send notification to contractor
                            notifyContractor(contractor);
                            getJobs();
                            setLoading(false);
                            alert(i18n.t('acceptedJob'));
                        })
                    })
                })
            })
            .catch((err) => {
                alert(err);
            });
        }
    }

    function decline(index){ 
        var all_jobs = [...jobs]
        all_jobs.splice(index, 1);
        setJobs(all_jobs);
    }

    async function viewContractor(contractor){
        await directus.items('users').readOne(contractor).then((res) => {
            setContractorData(res);
            toggleOverlay_1();
        })
    }

    return(
        <View style={styles.container}>
            {loading && <Loading />}

        <Overlay 
        overlayStyle={styles.overlay}
        supportedOrientations={['portrait', 'landscape']}
        isVisible={infoOverlay} 
        onBackdropPress={toggleOverlay_1}>

            <View style={styles.titleHeader}>
                <Ionicons name='information-circle-outline' size={27} color='grey'/>
                <Text style={styles.title}>{i18n.t('contractorInfo')}</Text>
            </View>

            <View style={styles.titleHeader}>
                <Text style={styles.megatitle}>{i18n.t('contractorName')}</Text>
                <Text style={styles.subtitle}>{contractorData.first_name + " " + contractorData.last_name}</Text>
            </View>

            <View style={styles.titleHeader}>
                <Text style={styles.megatitle}>{i18n.t('contractorRating')}</Text>
                <Text style={styles.subtitle}>{contractorData.rating == 0? 'No Rating' : Math.round(contractorData.rating) + "✭"}</Text>
            </View>

            <View style={styles.titleHeader}>
                <Ionicons name='call-outline' size={27} color='grey'/>
                <Text style={styles.title}>{i18n.t('contactContractor')}</Text>
            </View>

            <View style={styles.titleHeader}>
                <Text style={styles.megatitle}>{i18n.t('contractorEmail')}</Text>
                <Text style={styles.subtitle}>{contractorData.email}</Text>
            </View>

            <View style={styles.titleHeader}>
                <Text style={styles.megatitle}>{i18n.t('contractorPhone')}</Text>
                <Text style={styles.subtitle}>{contractorData.mobile_number}</Text>
            </View>

        </Overlay>

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

                    <Text style={{marginBottom: 10}}>
                        <Text style={styles.titles}>
                            {i18n.t('workersNeeded') + " "}
                        </Text>
                        <Text style={styles.subtitles}>
                            {job.number_of_workers}
                        </Text>
                    </Text>

                    <Button
                        buttonStyle={styles.acceptButton}
                        title={i18n.t('accept')}
                        onPress={() => accept(job)}
                        />

                    <Button
                        buttonStyle={styles.declineButton}
                        title={i18n.t('decline')}
                        onPress={() => decline(index)}
                    />

                    <Button
                        buttonStyle={styles.viewButton}
                        title={i18n.t('viewContractor')}
                        onPress={() => {viewContractor(job.contractor)}}
                    />

                    </Card>
                )
            })}

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
    acceptButton:{
        marginTop: 5, 
        backgroundColor: 'green'
    },
    declineButton:{
        marginTop: 10, 
        backgroundColor: 'red'
    },
    overlay:{
        borderRadius: 5,
    },
    title:{
        fontSize:18,
        marginLeft:20,
        color: 'grey'
    },
    subtitle:{
        fontSize:16,
        marginLeft:20
    },
    megatitle:{
        fontSize: 16,
        fontWeight: 'bold'
    },
    titleHeader:{
        flexDirection: 'row',
        alignItems: 'center'
    },
});