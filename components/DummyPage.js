import * as React from 'react';
import { View , Text , Platform, StyleSheet} from 'react-native';

export default function DummyPage({navigation}){
    return(
        <View style={styles.container}>
            <Text style={styles.text}>
                Must Contain Info for terms and conditions, privacy policy and help pages ...
            </Text>
        </View>
    );
};

export const styles = StyleSheet.create({
    container: {
        backgroundColor: "#fff",
        paddingTop:40,
        alignItems:"center",
        flex:1
    },
    text:{
        alignSelf: 'center',
        fontSize: 15
    }
});