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
        await directus.items('jobs').readByQuery({ filter: {now_status: 'in progress'}})
        .then((res) => {    
            res.data.forEach((job) => {
                if(moment().isBefore(moment(job.accepted_time).add(3, 'minutes')))
                    job.can_decline = true;
            })
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
            if(!moment().isBefore(moment(job.accepted_time).add(3, 'minutes')))
                job.can_decline = false;
          })
          setJobs(data);
        }, 60000); 
        return () => {
            clearInterval(timer);
        };
    }, [jobs])
    );

    async function openChat(contractor_id){
        setLoading(true);
        await directus.items('chats').createOne({
            contractor: contractor_id,
            worker: id,
            messages: []
        })
        .then((res) => {
            console.log("RES " + JSON.stringify(res));
            setLoading(false);
            navigation.navigate('Chat', {chat_id: res.id, user_id: id, contractor_id: contractor_id});
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

                    <Button
                        buttonStyle={styles.viewButton}
                        title={i18n.t('contact')}
                        onPress={() => contact(job)}
                        />
                    {job.can_decline == true? 
                    <Button
                        buttonStyle={styles.declineButton}
                        title={i18n.t('declineJ')}
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