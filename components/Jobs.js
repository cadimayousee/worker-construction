import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TouchableWithoutFeedback, Keyboard, Image, ScrollView} from 'react-native';
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { useFocusEffect } from '@react-navigation/native';
import { Directus } from '@directus/sdk';
import { Loading } from './Loading';
import i18n from 'i18n-js';

const directus = new Directus('https://iw77uki0.directus.app');

export default function Jobs({route}){
    const [jobs, setJobs] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const id = route.params.id;

    async function getJobs(){
        await directus.items('jobs').readByQuery({ filter: {now_status: 'in progress'}})
        .then((res) => {
            setJobs(res.data);
        })
        .catch((err) => {
            alert(err);
        })
    }

    React.useState(() => {
        getJobs();
    },[]);

    useFocusEffect(() => {
       getJobs();
    });

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
                        />
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
});