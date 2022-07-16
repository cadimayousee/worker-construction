import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements';
import { useFocusEffect } from '@react-navigation/native';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import moment from 'moment'
import i18n from 'i18n-js';

const directus = new Directus('https://iw77uki0.directus.app');

export default function IncomingJobs({route}){
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const id = route.params.id;

    async function getJobs(){
        await directus.items('jobs').readByQuery({ filter: {now_status: 'created'}})
        .then((res) => {
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

    async function accept(job){
        setLoading(true);
        await directus.items('workers').readOne(id)
        .then(async (res) => {
            //patch job 
            await directus.items('jobs').readOne(job.id)
            .then(async (response) => {
                var arr = [...response.workers];
                arr.push(res.id);
                await directus.items('jobs').updateOne(job.id, {
                    now_status: 'in progress',
                    number_of_workers: job.number_of_workers - 1,
                    workers : arr,
                    accepted_time: moment(),
                })
                .then((response) => {
                    getJobs();
                    setLoading(false);
                    alert(i18n.t('acceptedJob'));
                })
            })
            .catch((err) => {
                alert(err);
            });
        })
        .catch((err) => {
            alert(err);
        });
    }

    function decline(index){ 
        var all_jobs = [...jobs]
        all_jobs.splice(index, 1);
        setJobs(all_jobs);
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
    }
});